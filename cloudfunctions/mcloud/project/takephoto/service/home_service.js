/**
 * Notes: 全局/首页模块业务逻辑
 * Date: 2025-03-15 04:00:00 
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 */

const BaseProjectService = require('./base_project_service.js');
const setupUtil = require('../../../framework/utils/setup/setup_util.js');
const timeUtil = require('../../../framework/utils/time_util.js');
const ActivityModel = require('../model/activity_model.js');
const NewsModel = require('../model/news_model.js');

class HomeService extends BaseProjectService {

	async getSetup(key) {
		return await setupUtil.get(key);
	}

	/**首页列表 */
	async getHomeList() {

		let where = {
			NEWS_STATUS: 1, 
		};
		let orderBy = {
			'NEWS_VOUCH': 'desc',
			'NEWS_ORDER': 'asc',
			'NEWS_ADD_TIME': 'desc'
		}
		let fields = 'NEWS_TITLE,NEWS_CATE_NAME,NEWS_PIC,NEWS_DESC,NEWS_ADD_TIME';
		let newsList = await NewsModel.getAll(where, fields, orderBy, 10);
		for (let k = 0; k < newsList.length; k++) {
			newsList[k].NEWS_ADD_TIME = timeUtil.timestamp2Time(newsList[k].NEWS_ADD_TIME);
		}

		fields = 'ACTIVITY_STATUS,ACTIVITY_START,ACTIVITY_START_DAY,ACTIVITY_TITLE,ACTIVITY_CATE_NAME,ACTIVITY_JOIN_CNT,ACTIVITY_OBJ.cover,ACTIVITY_OBJ.swiper,ACTIVITY_OBJ.vouch,ACTIVITY_STOP,ACTIVITY_BEGIN,ACTIVITY_MAX_CNT';

		where = {
			ACTIVITY_STATUS: 1,
			ACTIVITY_VOUCH: 1
		}
		let activityList = await ActivityModel.getAll(where, fields, { 'ACTIVITY_ADD_TIME': 'desc' }, 10);

		for (let k = 0; k < activityList.length; k++) {

		}


		return { activityList, newsList }

	}
}

module.exports = HomeService;