# vue-dragula
> :ok_hand: Drag and drop so simple it hurts

Vue wrapper for [`dragula`][1].

## Install
#### CommonJS

- ~~Available through npm as `vue-dragula`, add `@next` to install the pre-release version.~~
- For now, this is available through github:
  ``` bash
  npm install git+https://github.com/ricochet1k/vue-dragula.git\#next
  ```

  ``` js
  var Vue = require('vue');
  var VueDragula = require('vue-dragula');

  Vue.use(VueDragula);
  ```

#### Direct include

- You can also directly include it with a `<script>` tag when you have Vue and dragula already included globally. It will automatically install itself.

## Usage

template:
``` html
<div class="wrapper">
  <div class="container" v-dragula="colOne" bag="first-bag">
    <!-- with click -->
    <div v-for="text in colOne" @click="onClick">{{text}} [click me]</div>
  </div>
  <div class="container" v-dragula="colTwo" bag="first-bag">
    <div v-for="text in colTwo">{{text}}</div>
  </div>
</div>
```

## APIs

You can access them from `Vue.dragula` or `this.$dragula`

### `options(name, options)`

Set dragula options, refer to: https://github.com/bevacqua/dragula#optionscontainers
``` js
...
new Vue({
  ...
  created: function () {
    Vue.dragula.options('my-bag', {
      direction: 'vertical'
    })
  }
})
```

### `getDrake(name)`

Returns the `drake` instance according the given name of a bag.

## Events
For drake events, refer to: https://github.com/bevacqua/dragula#drakeon-events


``` js
...
new Vue({
  mounted: function () {
    Vue.dragula.eventBus.$on('drop', function (args) {
      console.log('drop: ' + args[0])
    })
  }
})
```

## Element events for vue-dragula

Each `v-dragula` attribute should be accompanied by a `@dragdrop` event that will be called whenever a drag, drop, or remove action takes place. Inside the handler you can use `$event` which is the same as the `dropTarget` defined below. Typically you will want to do something like this:
``` html
<div v-dragula="list" @dragdrop="list = $event.model">
  <p v-for="item in list">{{item.text}}</p>
</div>
```

## EventBus Events for vue-dragula

| Event Name |      Listener Arguments      |
| :-------------: |:-------------:|
| drop-model | bagName, el, dropTarget, dropSource, dropIndex |
| remove-model | bagName, el, removeSource, dragIndex |

`dropTarget`, `dropSource`, properties:

- `el`: the DOM element
- `model`: updated model
- `expression`: the expression for directive
- `vm`: the Vue viewmodel object that owns the container node
- `dragIndex` or `dropIndex`: the index being dragged or dropped
- `source` or `target`: the opposite object, ex: `dropTarget.source.target === dropTarget`
  - `source` will be equal to `target` when sorting

You can bind to these events using the `eventBus` on `this.$dragula` or `Vue.dragula`, like so:
``` js
this.$dragula.eventBus.$on('drop-model',
  (bagName, el, dropTarget, dropSource, dropIndex) => {
    console.log('drop-model: ', bagName, el, dropTarget, dropSource, dropIndex)
    
  }
)
```

[1]: https://github.com/bevacqua/dragula
