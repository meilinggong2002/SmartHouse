/**
 * Notes: 积分业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2025-12-06 07:48:00 
 */

const BaseProjectService = require('./base_project_service.js');
const util = require('../../../framework/utils/util.js');
const ScoreModel = require('../model/score_model.js');
const UserModel = require('../model/user_model.js');

class ScoreService extends BaseProjectService {

	async getScoreRankList({
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
			'USER_SCORE_TOTAL': 'desc',
			'USER_ADD_TIME': 'desc'
		};
		let where = {
			USER_STATUS: UserModel.STATUS.COMM
		}
		let fields = 'USER_NAME,USER_SCORE_TOTAL';

		return await UserModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}

	async getScoreList({
		userId,
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
			'SCORE_ADD_TIME': 'desc'
		};
		let fields = '*';

		let where = {};
		where.and = {
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};

		if (userId) {
			where.and.SCORE_USER_ID = userId;
		}


		if (util.isDefined(search) && search) {
			where.or = [
				{ SCORE_ADMIN_DESC: ['like', search] },
				{ SCORE_DESC: ['like', search] },
			];

		} else if (sortType && util.isDefined(sortVal)) {

			// 搜索菜单
			switch (sortType) {
				case 'type': {
					if (sortVal) where.and.SCORE_TYPE = Number(sortVal);
					break;
				}
			}
		}

		return await ScoreModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);

	}


	// 用户积分变动
	async changeScore() {

	}

	// 统计某用户积分
	async statUserScore(userId) {

	}

}

module.exports = ScoreService;