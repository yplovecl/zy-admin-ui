import request from '@/utils/request'

// 查询APP用户列表
export function listUser(query) {
  return request({
    url: '/seismograph/user/list',
    method: 'get',
    params: query
  })
}

// 查询APP用户详细
export function getUser(userId) {
  return request({
    url: '/seismograph/user/' + userId,
    method: 'get'
  })
}

// 新增APP用户
export function addUser(data) {
  return request({
    url: '/seismograph/user',
    method: 'post',
    data: data
  })
}

// 修改APP用户
export function updateUser(data) {
  return request({
    url: '/seismograph/user',
    method: 'put',
    data: data
  })
}

// 删除APP用户
export function delUser(userId) {
  return request({
    url: '/seismograph/user/' + userId,
    method: 'delete'
  })
}
