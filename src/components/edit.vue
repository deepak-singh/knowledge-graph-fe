<template>
  <span style="left">
    <h3>Edit tree</h3>
    <div id="tree">
    </div>
  </span>
</template>

<script>
import axios from 'axios'

export default {
  name: 'edit_tree',
  data () {
    return {
      tree_holder: undefined,
      tree: undefined,
      position: {
        'inside': 'first-child',
        'after': 'right'
      },
      error_msg: 'Something went wrong!'
    }
  },
  created () {
    var self = this
    axios.get('http://localhost:8000/api/v1/content_tree/?content__syllabus__standard=2&content__syllabus__subject=1')
    .then(response => {
      self.tree_holder = window.$('#tree').tree({
        data: response.data.objects,
        dragAndDrop: true,
        autoOpen: 0
      })

      window.$('#tree').bind('tree.move', function (event) {
        event.preventDefault()
        var nodeId = event.move_info.moved_node.id
        var targetId = event.move_info.target_node.id
        var position = self.position[event.move_info.position]
        var obj = {
          'node_id': nodeId,
          'target_id': targetId,
          'position': position
        }
        axios.patch('http://localhost:8000/api/v1/content_tree/move_node/', obj)
        .then(response => {
          event.move_info.do_move()
          window.$.toaster({ message: 'Tree updated' })
        })
        .catch(response => {
          window.$.toaster({ message: self.error_msg })
        })
        // console.log('previous_parent', event.move_info.previous_parent)
      })
    })
    .catch(response => {
      self.error_msg = response.data
      console.log('something went wrong')
    })
  },
  methods: {
    save () {
      this.tree = this.tree_holder.tree('toJson')
      axios.post('http://localhost:8000/api/v1/content_tree/', JSON.parse(this.tree))
      .then(response => {
        console.log(response)
      })
      .catch(response => {
        console.log(response)
      })
    }
  }
}
</script>

<style>
h1, h2 {
  font-weight: normal;
}

li {
  background-color: #efefef;
}

a {
  color: #42b983;
}


.left {
  text-align: left;
}
</style>
