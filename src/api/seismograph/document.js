import request from '@/utils/request'

// 查询文档管理列表
export function listDocument(query) {
  return request({
    url: '/seismograph/document/list',
    method: 'get',
    params: query
  })
}

// 查询文档管理详细
export function getDocument(documentMgtId) {
  return request({
    url: '/seismograph/document/' + documentMgtId,
    method: 'get'
  })
}

// 新增文档管理
export function addDocument(data) {
  return request({
    url: '/seismograph/document',
    method: 'post',
    data: data
  })
}

// 修改文档管理
export function updateDocument(data) {
  return request({
    url: '/seismograph/document',
    method: 'put',
    data: data
  })
}

// 删除文档管理
export function delDocument(documentMgtId) {
  return request({
    url: '/seismograph/document/' + documentMgtId,
    method: 'delete'
  })
}
