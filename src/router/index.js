import Vue from 'vue'
import Router from 'vue-router'
import Add from '@/components/add'
import Edit from '@/components/edit'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'add',
      component: Add
    },
    {
      path: '/edit',
      name: 'Edit',
      component: Edit
    }
  ]
})
