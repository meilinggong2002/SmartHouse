/**
 * Notes: 项目上报实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2025-07-01 19:20:00 
 */


const BaseProjectModel = require('./base_project_model.js');

class ActivityJoinModel extends BaseProjectModel {

}

// 集合名
ActivityJoinModel.CL = BaseProjectModel.C('activity_join');

ActivityJoinModel.DB_STRUCTURE = {
	_pid: 'string|true',
	ACTIVITY_JOIN_ID: 'string|true',
	ACTIVITY_JOIN_ACTIVITY_ID: 'string|true|comment=上报PK',
	ACTIVITY_JOIN_ACTIVITY_TITLE: 'string|true',

	ACTIVITY_JOIN_IS_ADMIN: 'int|true|default=0|comment=是否管理员添加 0/1',
 

	ACTIVITY_JOIN_USER_ID: 'string|true|comment=用户ID',
	ACTIVITY_JOIN_SCORE: 'int|true|default=0|comment=获取积分',

	ACTIVITY_JOIN_FORMS: 'array|true|default=[]|comment=表单',
	ACTIVITY_JOIN_OBJ: 'object|true|default={}',

	ACTIVITY_JOIN_STATUS: 'int|true|default=0|comment=状态 1=成功, 99=系统撤销',
	ACTIVITY_JOIN_REASON: 'string|false|comment=撤销理由',

	ACTIVITY_JOIN_ADD_MONTH: 'string|false',

	ACTIVITY_JOIN_ADD_TIME: 'int|true',
	ACTIVITY_JOIN_EDIT_TIME: 'int|true',
	ACTIVITY_JOIN_ADD_IP: 'string|false',
	ACTIVITY_JOIN_EDIT_IP: 'string|false',
};

// 字段前缀
ActivityJoinModel.FIELD_PREFIX = "ACTIVITY_JOIN_";

/**
 * 状态 1=成功, 99=系统撤销
 */
ActivityJoinModel.STATUS = {
	UNUSE: 0,
	SUCC: 1,
	ADMIN_CANCEL: 99
};

ActivityJoinModel.STATUS_DESC = {
	UNUSE: '待审核',
	SUCC: '成功',
	ADMIN_CANCEL: '审核未过'
};


module.exports = ActivityJoinModel;