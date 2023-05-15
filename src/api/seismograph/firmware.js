import request from '@/utils/request'

// 查询固件升级列表
export function listFirmware(query) {
    return request({
        url: '/seismograph/firmware/list',
        method: 'get',
        params: query
    })
}

// 查询固件升级详细
export function getFirmware(firmwareId) {
    return request({
        url: '/seismograph/firmware/' + firmwareId,
        method: 'get'
    })
}

// 新增固件升级
export function addFirmware(data) {
    return request({
        url: '/seismograph/firmware',
        method: 'post',
        data: data
    })
}

// 修改固件升级
export function updateFirmware(data) {
    return request({
        url: '/seismograph/firmware',
        method: 'put',
        data: data
    })
}

// 删除固件升级
export function delFirmware(firmwareId) {
    return request({
        url: '/seismograph/firmware/' + firmwareId,
        method: 'delete'
    })
}
