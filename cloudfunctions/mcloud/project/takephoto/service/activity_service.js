/**
 * Notes: 项目模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2025-06-23 07:48:00 
 */

const BaseProjectService = require('./base_project_service.js');
const util = require('../../../framework/utils/util.js');

const dataUtil = require('../../../framework/utils/data_util.js');
const timeUtil = require('../../../framework/utils/time_util.js');
const ActivityModel = require('../model/activity_model.js');
const UserModel = require('../model/user_model.js');
const ActivityJoinModel = require('../model/activity_join_model.js');

class ActivityService extends BaseProjectService {

	// 获取当前项目状态
	getJoinStatusDesc(activity) {
		let timestamp = this._timestamp;

		if (activity.ACTIVITY_STATUS == ActivityModel.STATUS.UNUSE)
			return '项目停止';
		else if (activity.ACTIVITY_START > timestamp)
			return '项目未开始';
		else if (activity.ACTIVITY_STOP <= timestamp)
			return '项目结束';
		else
			return '进行中';
	}

	/** 浏览信息 */
	async viewActivity(userId, id) {

		let fields = '*';

		let where = {
			_id: id,
			ACTIVITY_STATUS: ActivityModel.STATUS.COMM,
		}
		let activity = await ActivityModel.getOne(where, fields);
		if (!activity) return null;

		ActivityModel.inc(id, 'ACTIVITY_VIEW_CNT', 1);


		return activity;
	}

	/** 取得分页列表 */
	async getActivityList(type = 'run', {
		cateId, //分类查询条件
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序 
		page,
		size,
		isTotal = true,
		oldTotal
	}) {

		orderBy = orderBy || {
			'ACTIVITY_ORDER': 'asc',
			'ACTIVITY_START': 'asc',
			'ACTIVITY_ADD_TIME': 'desc'
		};
		let fields = 'ACTIVITY_ADDRESS,ACTIVITY_STOP,ACTIVITY_JOIN_CNT,ACTIVITY_OBJ,ACTIVITY_VIEW_CNT,ACTIVITY_TITLE,ACTIVITY_MAX_CNT,ACTIVITY_START_DAY,ACTIVITY_START,ACTIVITY_ORDER,ACTIVITY_STATUS,ACTIVITY_CATE_NAME,ACTIVITY_OBJ.cover,ACTIVITY_OBJ.score';

		let where = {};

		if (cateId && cateId !== '0') where.ACTIVITY_CATE_ID = cateId;

		where.ACTIVITY_STATUS = ActivityModel.STATUS.COMM; // 状态  

		// 进行状态
		let day = timeUtil.time('Y-M-D');
		if (type == 'run') {
			where.ACTIVITY_STOP = ['>=', this._timestamp];
		}
		else {
			where.ACTIVITY_STOP = ['<=', this._timestamp];
			orderBy = {
				'ACTIVITY_ORDER': 'asc',
				'ACTIVITY_START': 'desc',
				'ACTIVITY_ADD_TIME': 'desc'
			};
		}

		if (util.isDefined(search) && search) {
			where['ACTIVITY_TITLE'] = ['like', search];

		} else if (sortType && util.isDefined(sortVal)) {

			// 搜索菜单
			switch (sortType) {
				case 'cateId': {
					if (sortVal) where.ACTIVITY_CATE_ID = String(sortVal);
					break;
				}
				case 'sort': {
					// 排序
					orderBy = this.fmtOrderBySort(sortVal, 'ACTIVITY_ADD_TIME');
					break;
				}
			}
		}

		let ret = await ActivityModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
		if (ret) ret.type = type;
		return ret;
	}


	/** 取得我的上报分页列表 */
	async getMyActivityJoinList(userId, {
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序 
		page,
		size,
		isTotal = true,
		oldTotal
	}) {
		orderBy = orderBy || {
			'ACTIVITY_JOIN_ADD_TIME': 'desc'
		};
		let fields = 'ACTIVITY_JOIN_REASON,ACTIVITY_JOIN_ACTIVITY_ID,ACTIVITY_JOIN_ACTIVITY_TITLE,ACTIVITY_JOIN_STATUS,ACTIVITY_JOIN_ADD_TIME';

		let where = {
			ACTIVITY_JOIN_USER_ID: userId
		};

		if (util.isDefined(search) && search) {
			where['activity.ACTIVITY_TITLE'] = {
				$regex: '.*' + search,
				$options: 'i'
			};
		} else if (sortType) {
			// 搜索菜单
			switch (sortType) {
				case 'timedesc': { //按时间倒序
					orderBy = {
						'activity.ACTIVITY_START': 'desc',
						'ACTIVITY_JOIN_ADD_TIME': 'desc'
					};
					break;
				}
				case 'timeasc': { //按时间正序
					orderBy = {
						'activity.ACTIVITY_START': 'asc',
						'ACTIVITY_JOIN_ADD_TIME': 'asc'
					};
					break;
				}
				case 'status': {
					where.ACTIVITY_JOIN_STATUS = Number(sortVal)
					break;
				}
			}
		}


		let result = await ActivityJoinModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);

		return result;
	}

	/** 取得我的上报详情 */
	async getMyActivityJoinDetail(userId, activityJoinId) {

		let fields = '*';

		let where = {
			_id: activityJoinId,
			ACTIVITY_JOIN_USER_ID: userId
		};
		let activityJoin = await ActivityJoinModel.getOne(where, fields);

		return activityJoin;
	}

	//################## 上报 
	// 上报 
	async activityJoin() {

	}


	async statActivityJoin(id) {
		// 上报数
		let where = {
			ACTIVITY_JOIN_ACTIVITY_ID: id,
			ACTIVITY_JOIN_STATUS: ActivityJoinModel.STATUS.SUCC
		}
		let cnt = await ActivityJoinModel.count(where);


		await ActivityModel.edit(id, { ACTIVITY_JOIN_CNT: cnt });
	}

	/**  上报前获取关键信息 */
	async detailForActivityJoin(userId, activityId) {
		let fields = 'ACTIVITY_JOIN_FORMS, ACTIVITY_TITLE';

		let where = {
			_id: activityId,
			ACTIVITY_STATUS: ActivityModel.STATUS.COMM,
		}
		let activity = await ActivityModel.getOne(where, fields);
		if (!activity)
			this.AppError('该项目不存在');

		if (activity.ACTIVITY_MAX_CNT > 0) {
			let cnt = await ActivityJoinModel.count({ ACTIVITY_JOIN_USER_ID: userId });
			if (cnt >= activity.ACTIVITY_MAX_CNT)
				this.AppError('该项目您已经上报' + cnt + '次，已超过可提交上限~');
		}


		let myForms = [];

		if (myForms.length == 0) {

			let user = await UserModel.getOne({ USER_MINI_OPENID: userId, USER_STATUS: UserModel.STATUS.COMM });
			if (!user) this.AppError('用户异常');

			// 取得我的上报信息
			myForms = [
				{ mark: 'name', type: 'text', title: '姓名', val: user.USER_NAME },
				{ mark: 'phone', type: 'mobile', title: '手机', val: user.USER_MOBILE },
			]

		}

		activity.myForms = myForms;

		return activity;
	}

	/** 撤销我的上报 只有成功可以撤销 取消即为删除记录 */
	async cancelMyActivityJoin(userId, activityJoinId) {
		let where = {
			ACTIVITY_JOIN_USER_ID: userId,
			_id: activityJoinId,
			ACTIVITY_JOIN_STATUS: 0
		};
		let activityJoin = await ActivityJoinModel.getOne(where);

		if (!activityJoin) {
			this.AppError('未找到可撤销的记录');
		}

		let activity = await ActivityModel.getOne(activityJoin.ACTIVITY_JOIN_ACTIVITY_ID);
		if (!activity)
			this.AppError('该项目不存在');

		if (activity.ACTIVITY_STATUS == ActivityModel.STATUS.UNUSE)
			this.AppError('该项目已停止，不能撤销');

		if (activity.ACTIVITY_CANCEL_SET == 0)
			this.AppError('该项目设置了不能撤销');

		if (activity.ACTIVITY_CANCEL_SET == 2 && activity.ACTIVITY_STOP < this._timestamp)
			this.AppError('该项目已经截止上报，不能撤销');

		await ActivityJoinModel.del(where);

		// 上报数量统计
		await this.statActivityJoin(activityJoin.ACTIVITY_JOIN_ACTIVITY_ID);

	}


	/** 按天获取上报项目 */
	async getActivityListByDay(day) {
		let start = timeUtil.time2Timestamp(day);
		let end = start + 86400 * 1000 - 1;
		let where = {
			ACTIVITY_STATUS: ActivityModel.STATUS.COMM,
			ACTIVITY_START: ['between', start, end],
		};

		let orderBy = {
			'ACTIVITY_ORDER': 'asc',
			'ACTIVITY_ADD_TIME': 'desc'
		};

		let fields = 'ACTIVITY_TITLE,ACTIVITY_START,ACTIVITY_OBJ.cover';

		let list = await ActivityModel.getAll(where, fields, orderBy);

		let retList = [];

		for (let k = 0; k < list.length; k++) {

			let node = {};
			node.timeDesc = timeUtil.timestamp2Time(list[k].ACTIVITY_START, 'h:m');
			node.title = list[k].ACTIVITY_TITLE;
			node.pic = list[k].ACTIVITY_OBJ.cover[0];
			node._id = list[k]._id;
			retList.push(node);

		}
		return retList;
	}

	/**
	 * 获取从某天开始可报名的日期
	 * @param {*} fromDay  日期 Y-M-D
	 */
	async getActivityHasDaysFromDay(fromDay) {
		let where = {
			ACTIVITY_START: ['>=', timeUtil.time2Timestamp(fromDay)],
		};

		let fields = 'ACTIVITY_START';
		let list = await ActivityModel.getAllBig(where, fields);

		let retList = [];
		for (let k = 0; k < list.length; k++) {
			let day = timeUtil.timestamp2Time(list[k].ACTIVITY_START, 'Y-M-D');
			if (!retList.includes(day)) retList.push(day);
		}
		return retList;
	}


}

module.exports = ActivityService;