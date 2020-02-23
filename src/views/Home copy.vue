<!--
 * @Descripttion: 
 * @Author: yanxu gong
 * @Date: 2020-02-21 11:26:15
 * @LastEditors: yanxu gong
 * @LastEditTime: 2020-02-22 11:54:15
 -->
<template>
  <div class="home">
    <Upload></Upload>
    <el-tree
      :data="treeData"
      default-expand-all
      :expand-on-click-node="false"
      draggable
    >
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <el-input
          v-if="isSelect(node) && isEdit"
          v-model="input"
          size="mini"
          placeholder="请输入内容"
        ></el-input>
        <span>{{ node.label }} {{ `id:${node.id}` }}</span>
        <span>
          <el-button type="text" size="mini" @click="() => append(data)">
            增加
          </el-button>
          <el-button type="text" size="mini" @click="() => edit(data)">
            编辑
          </el-button>
          <el-button type="text" size="mini" @click="() => remove(node, data)">
            删除
          </el-button>
        </span>
      </span>
    </el-tree>
  </div>
</template>

<script>
import Upload from '@/components/Upload.vue'
import { deepCopy } from '@/utils/common'

let id = 1000

export default {
  name: 'Home',
  components: { Upload },
  data() {
    const data = [
      {
        id: 1,
        label: '一级 1',
        children: [
          {
            id: 2,
            label: '二级 1-1',
            children: [
              {
                id: 3,
                label: '三级 1-1-1'
              },
              {
                id: 4,
                label: '三级 1-1-2'
              }
            ]
          }
        ]
      },
      {
        id: 5,
        label: '一级 2',
        children: [
          {
            id: 6,
            label: '二级 2-1'
          },
          {
            id: 7,
            label: '二级 2-2'
          }
        ]
      },
      {
        id: 8,
        label: '一级 3',
        children: [
          {
            id: 9,
            label: '二级 3-1'
          },
          {
            id: 10,
            label: '二级 3-2'
          }
        ]
      }
    ]
    return {
      treeData: deepCopy(data),
      input: '',
      isEdit: false,
      selectId: ''
    }
  },
  computed: {
    showInput() {
      return
    }
  },
  methods: {
    isSelect(data) {
      return this.selectId === data.id
    },
    append(data) {
      const newChild = { id: id++, label: 'test', children: [] }
      if (!data.children) {
        this.$set(data, 'children', [])
      }
      data.children.push(newChild)
    },
    edit(data) {
      const { id, label } = data
      this.input = label
      this.selectId = id
      this.isEdit = true
      console.log(this.selectId)
      console.log('*************')
      console.log(this.isSelect(data))
      console.log(this.isEdit)
    },
    remove(node, data) {
      const parent = node.parent
      const children = parent.data.children || parent.data
      const index = children.findIndex(d => d.id === data.id)
      children.splice(index, 1)
    }
  }
}
</script>
