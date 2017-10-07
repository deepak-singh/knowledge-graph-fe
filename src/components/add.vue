<template>
  <span style="left">
    <h3>Select standard and Subject  
      <span v-if="standard && subject">- {{ addMode ? 'Add mode' : 'Edit mode' }}</span>
      </h3>
    
    Standard: 
    <select v-model="standard" @change="getContentAndSetMode()">
      <option value="">Select...</option>
      <option v-for="standard in standards" :value="standard.id" >{{ standard.name }}</option>
    </select> 

    Subject:
    <select v-model="subject" @change="getContentAndSetMode()">
      <option value="">Select</option>
      <option v-for="subject in subjects" :value="subject.id" > {{ subject.name }} </option>
    </select>
    <br/><br/>

    <div id="tree">
    </div>
  
    <br/><br/>
    <span v-if="addMode">
      <button type="button" @click="save" class="btn btn-primary float-right">Create Tree</button>
    </span>
  </span>
</template>

<script>
import axios from 'axios'
import conf from '@/conf'
const api = conf.api

export default {
  name: 'create_tree',
  data () {
    return {
      tree_holder: undefined,
      tree: undefined,
      standards: [],
      subjects: [],
      standard: undefined,
      subject: undefined,
      addMode: false,
      sample: [],
      position: {
        'inside': 'first-child',
        'after': 'right'
      },
      error_msg: 'Something went wrong!'
    }
  },
  created () {
    this.getStandards()
    this.getSubjects()
    this.initTree()
  },
  methods: {
    initTree () {
      var self = this
      this.$nextTick(function () {
        this.tree_holder = window.$('#tree').tree({
          data: self.sample,
          dragAndDrop: true,
          autoOpen: 0
        })
        this.bindTreeEdit() // Bind event of node movements with api
      })
    },
    getStandards () {
      axios.get(api + 'standard/')
      .then(response => {
        this.standards = response.data.objects
      })
    },
    getSubjects () {
      axios.get(api + 'subject/')
      .then(response => {
        this.subjects = response.data.objects
      })
    },
    getContentAndSetMode () {
      if (this.standard && this.subject) {
        axios.get(api + 'content_tree/?content__syllabus__standard=' + this.standard + '&content__syllabus__subject=' + this.subject)
        .then(response => {
          if ('objects' in response.data) {
            window.$('#tree').tree('loadData', response.data.objects)
            this.addMode = false
          } else {
            this.addMode = true
            this.getFlatContent()
          }
        })
      }
    },
    bindTreeEdit () {
      var self = this
      window.$('#tree').bind('tree.move', function (event) {
        if (!self.addMode) {
          event.preventDefault() // Prevent default, dont confirm the move until saved in DB
          var nodeId = event.move_info.moved_node.id
          var targetId = event.move_info.target_node.id
          var position = self.position[event.move_info.position]
          var obj = {
            'node_id': nodeId,
            'target_id': targetId,
            'position': position
          }
          axios.patch(api + 'content_tree/move_node/', obj)
          .then(response => {
            event.move_info.do_move() // Move when 200 ok
            window.$.toaster({ message: 'Tree updated' })
          })
          .catch(response => {
            window.$.toaster({ message: self.error_msg })
          })
        }
        // console.log('previous_parent', event.move_info.previous_parent)
      })
    },
    getFlatContent () {
      axios.get(api + 'content/?syllabus__standard=' + this.standard + '&syllabus__subject=' + this.subject)
      .then(response => {
        window.$('#tree').tree('loadData', response.data.objects)
      })
      .catch(response => {
        console.log('something went wrong')
      })
    },
    save () {
      this.tree = this.tree_holder.tree('toJson')
      axios.post(api + 'content_tree/', JSON.parse(this.tree))
      .then(response => {
        console.log(response)
        window.$.toaster({ message: 'Tree saved' })
        this.getContentAndSetMode()
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
