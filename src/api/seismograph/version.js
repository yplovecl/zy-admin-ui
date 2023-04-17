import request from '@/utils/request'

// 查询APP版本信息列表
export function listVersion(query) {
  return request({
    url: '/seismograph/version/list',
    method: 'get',
    params: query
  })
}

// 查询APP版本信息详细
export function getVersion(versionId) {
  return request({
    url: '/seismograph/version/' + versionId,
    method: 'get'
  })
}

// 新增APP版本信息
export function addVersion(data) {
  return request({
    url: '/seismograph/version',
    method: 'post',
    data: data
  })
}

// 修改APP版本信息
export function updateVersion(data) {
  return request({
    url: '/seismograph/version',
    method: 'put',
    data: data
  })
}

// 删除APP版本信息
export function delVersion(versionId) {
  return request({
    url: '/seismograph/version/' + versionId,
    method: 'delete'
  })
}
