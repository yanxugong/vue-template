<!--
 * @Descripttion: 
 * @Author: yanxu gong
 * @Date: 2020-02-21 11:26:15
 * @LastEditors: yanxu gong
 * @LastEditTime: 2020-02-23 16:21:00
 -->
<template>
  <div class="home">
    <Upload></Upload>
    <button @click="addNode">Add Node</button>
    <vue-tree-list
      @click="onClick"
      @change-name="onChangeName"
      @delete-node="onDel"
      @add-node="onAddNode"
      :model="data"
      default-tree-node-name="new node"
      default-leaf-node-name="new leaf"
      v-bind:default-expanded="false"
    >
      <span class="icon" slot="addTreeNodeIcon">📂</span>
      <span class="icon" slot="addLeafNodeIcon">＋</span>
      <span class="icon" slot="editNodeIcon">📃</span>
      <span class="icon" slot="delNodeIcon">✂️</span>
      <span class="icon" slot="leafNodeIcon">🍃</span>
      <span class="icon" slot="treeNodeIcon">🌲</span>
    </vue-tree-list>
    <el-button @click="downloadFile">下载</el-button>
    <!-- <button @click="getNewTree">Get new tree</button> -->
    <!-- <pre>
      {{ newTree }}
    </pre> -->
  </div>
</template>

<script>
import Upload from '@/components/Upload.vue'
import { VueTreeList, Tree, TreeNode } from 'vue-tree-list'

export default {
  name: 'Home',
  components: { Upload, VueTreeList },
  data() {
    return {
      newTree: {},
      data: new Tree([
        {
          name: 'Node 1',
          id: 1,
          pid: 0,
          dragDisabled: true,
          addTreeNodeDisabled: true,
          addLeafNodeDisabled: true,
          editNodeDisabled: true,
          delNodeDisabled: true,
          children: [
            {
              name: 'Node 1-2',
              id: 2,
              isLeaf: true,
              pid: 1
            }
          ]
        },
        {
          name: 'Node 2',
          id: 3,
          pid: 0,
          disabled: true
        },
        {
          name: 'Node 3',
          id: 4,
          pid: 0
        }
      ])
    }
  },
  computed: {},
  mounted() {
    this.getModel()
  },
  methods: {
    onDel(node) {
      console.log(node)
      node.remove()
    },

    onChangeName(params) {
      console.log(params)
    },

    onAddNode(params) {
      console.log(params)
    },

    onClick(params) {
      console.log(params)
    },

    addNode() {
      var node = new TreeNode({ name: 'new node', isLeaf: false })
      if (!this.data.children) this.data.children = []
      this.data.addChildren(node)
    },

    getNewTree() {
      var vm = this
      function _dfs(oldNode) {
        var newNode = {}

        for (var k in oldNode) {
          if (k !== 'children' && k !== 'parent') {
            newNode[k] = oldNode[k]
          }
        }

        if (oldNode.children && oldNode.children.length > 0) {
          newNode.children = []
          for (var i = 0, len = oldNode.children.length; i < len; i++) {
            newNode.children.push(_dfs(oldNode.children[i]))
          }
        }
        return newNode
      }

      vm.newTree = _dfs(vm.data)
    },
    async downloadFile() {
      const res = await this.$axios.get('http://localhost:3000/download', {
        filePath: '111'
      })
      console.log(res)
    },
    async getModel() {
      const res = await this.$axios.get('/X-00001.xml')
      var jsonObj = this.$x2js.xml2js(res.data)
      console.log(jsonObj)
      var xml = this.$x2js.js2xml(jsonObj)
      console.log(xml)
      // this.data = new Tree([
      //   {
      //     name: 'Node 1',
      //     id: 1,
      //     pid: 0,
      //     dragDisabled: true,
      //     addTreeNodeDisabled: true,
      //     addLeafNodeDisabled: true,
      //     editNodeDisabled: true,
      //     delNodeDisabled: true,
      //     children: [
      //       {
      //         name: 'Node 1-2',
      //         id: 2,
      //         isLeaf: true,
      //         pid: 1
      //       }
      //     ]
      //   },
      //   {
      //     name: 'Node 2',
      //     id: 3,
      //     pid: 0,
      //     disabled: true
      //   },
      //   {
      //     name: 'Node 3',
      //     id: 4,
      //     pid: 0
      //   }
      // ])
    }
  }
}
</script>

<style lang="less" rel="stylesheet/less">
.vtl {
  .vtl-drag-disabled {
    background-color: #d0cfcf;
    &:hover {
      background-color: #d0cfcf;
    }
  }
  .vtl-disabled {
    background-color: #d0cfcf;
  }
}
</style>

<style lang="less" rel="stylesheet/less" scoped>
.icon {
  &:hover {
    cursor: pointer;
  }
}
</style>
