import dragula from 'dragula'

if (!dragula) {
  throw new Error('[vue-dragula] cannot locate dragula.')
}

class DragulaService {
  constructor (Vue) {
    this.bags = {} // bag store
    this.eventBus = new Vue()
    this.events = [
      'cancel',
      'cloned',
      'drag',
      'dragend',
      'drop',
      'out',
      'over',
      'remove',
      'shadow',
      'drop-model',
      'remove-model'
    ]
  }

  add (name, drake) {
    let bag = this.bags[name]
    if (!bag) {
      bag = {
        name,
        drake
      }
      this.bags[name] = bag
    } else {
      // update drake
      const oldDrake = bag.drake
      drake.containers = oldDrake.containers
      drake.models = oldDrake.models
      bag.drake = drake
      oldDrake.destroy()
    }

    if (!bag.initEvents) {
      this.setupEvents(bag)
    }
    return bag
  }

  setOptions (name, options) {
    let bag = this.add(name, dragula(options))
    this.registerDrake(name, bag.drake)
  }

  getDrake (name) {
    return (this.bags[name] || {}).drake
  }

  registerDrake (name, drake) {
    if (drake.registered) { // do not register events twice
      return
    }
    let dragElm
    let dragData
    let dragIndex
    let dropIndex
    let sourceModelContainer
    let sourceModel
    let targetModel
    function clear() {
      dragElm = null
      dragData = null
      dragIndex = null
      dropIndex = null
      sourceModelContainer = null
      sourceModel = null
      targetModel = null
    }
    drake.on('remove', (el, container, source) => {
      if (!drake.models) {
        return
      }
      const sourceModelContainer = this.findModelContainerByContainer(source, drake)
      sourceModel = sourceModelContainer.model
      sourceModel.splice(dragIndex, 1)
      drake.cancel(true)
      const removeSource = {
        vm: sourceModelContainer.vm,
        handlers: sourceModelContainer.handlers,
        el: source,
        dragIndex: dragIndex,
        removed: dragData,
        model: sourceModel,
        expression: sourceModelContainer.expression
      }
      this.eventBus.$emit('remove-model', name, el, removeSource, dragIndex);
      if (removeSource.handlers.dragdrop)
        removeSource.handlers.dragdrop(removeSource);
      clear();
    })
    drake.on('drag', (el, source) => {
      dragElm = el
      dragIndex = this.domIndexOf(el, source)
      sourceModelContainer = this.findModelContainerByContainer(source, drake)
      sourceModel = sourceModelContainer.model
      dragData = sourceModel[dragIndex]

      if (sourceModelContainer.handlers['dg-drag'])
        sourceModelContainer.handlers['dg-drag']({el, source, dragIndex});
    })
    drake.on('drop', (dropElm, target, source) => {
      if (!drake.models || !target) {
        return
      }
      dropIndex = this.domIndexOf(dropElm, target)
      const dropSource = {
        vm: sourceModelContainer.vm,
        handlers: sourceModelContainer.handlers,
        el: source,
        dragIndex: dragIndex,
        model: sourceModel,
        expression: sourceModelContainer.expression
      }
      let dropTarget = {}

      if (target === source) {
        // using original splice to avoid re-render
        Array.prototype.splice.call(sourceModel,
          dropIndex,
          0,
          Array.prototype.splice.call(sourceModel, dragIndex, 1)[0]
        )

        dropTarget = dropSource
      } else {
        let notCopy = dragElm === dropElm
        const targetModelContainer = this.findModelContainerByContainer(target, drake)
        targetModel = targetModelContainer.model
        let dropElmModel = notCopy
          ? sourceModel[dragIndex]
          : JSON.parse(JSON.stringify(sourceModel[dragIndex]))
        if (notCopy) {
          Array.prototype.splice.call(sourceModel, dragIndex, 1)
        }
        Array.prototype.splice.call(targetModel, dropIndex, 0, dropElmModel)

        dropTarget = {
          vm: targetModelContainer.vm,
          handlers: targetModelContainer.handlers,
          el: target,
          dropIndex: dropIndex,
          model: targetModel,
          expression: targetModelContainer.expression
        }
      }
      drake.cancel(true)
      dropTarget.source = dropSource
      dropSource.target = dropTarget
      this.eventBus.$emit('drop-model', name, dropElm, dropTarget, dropSource, dropIndex)
      if (dropSource.handlers.dragdrop)
        dropSource.handlers.dragdrop(dropSource);
      if (dropSource !== dropTarget && dropTarget.handlers.dragdrop)
        dropTarget.handlers.dragdrop(dropTarget);
      clear();
    })
    drake.registered = true
  }

  destroy (name) {
    let bag = this.bags[name]
    if (!bag) { return }
    delete this.bags[name]
    bag.drake.destroy()
  }

  setupEvents (bag) {
    bag.initEvents = true
    let _this = this
    let emitter = type => {
      function replicateEvent (...args) {
        _this.eventBus.$emit.apply(_this.eventBus, [type, bag.name].concat(args))
      }
      bag.drake.on(type, replicateEvent)
    }
    this.events.forEach(emitter)
  }

  domIndexOf (child, parent) {
    return Array.prototype.indexOf.call(
      parent.children,
      child
    )
  }

  findModelContainerByContainer (container, drake) {
    if (!drake.models) {
      return
    }
    return drake.models.find(model => model.container === container)
  }
}

export default DragulaService
