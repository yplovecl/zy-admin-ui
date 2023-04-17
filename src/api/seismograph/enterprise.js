import request from '@/utils/request'

// 查询企业列表
export function listEnterprise(query) {
  return request({
    url: '/seismograph/enterprise/list',
    method: 'get',
    params: query
  })
}

// 查询企业详细
export function getEnterprise(enterpriseId) {
  return request({
    url: '/seismograph/enterprise/' + enterpriseId,
    method: 'get'
  })
}

// 新增企业
export function addEnterprise(data) {
  return request({
    url: '/seismograph/enterprise',
    method: 'post',
    data: data
  })
}

// 修改企业
export function updateEnterprise(data) {
  return request({
    url: '/seismograph/enterprise',
    method: 'put',
    data: data
  })
}

// 删除企业
export function delEnterprise(enterpriseId) {
  return request({
    url: '/seismograph/enterprise/' + enterpriseId,
    method: 'delete'
  })
}
