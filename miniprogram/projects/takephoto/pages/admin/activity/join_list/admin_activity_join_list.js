const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');
const cacheHelper = require('../../../../../../helper/cache_helper.js');
const helper = require('../../../../../../helper/helper.js');
const cloudHelper = require('../../../../../../helper/cloud_helper.js');
const CACHE_CANCEL_REASON = 'ACTIVITY_JOIN_CANCEL_REASON';


Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		isLoad: false,
		isAllFold: false,

		parentDayIdx: 0,
		parentTimeIdx: 0,

		menuIdx: 0,

		activityId: '',

		title: '',
		titleEn: '',

		cancelModalShow: false,
		cancelAllModalShow: false,
		formReason: '',
		curIdx: -1
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		if (!AdminBiz.isAdmin(this)) return;

		// 附加参数 
		if (options && options.activityId) {
			//设置搜索菜单 
			this._getSearchMenu();

			this.setData({
				activityId: options.activityId,
				_params: {
					activityId: options.activityId
				}
			}, () => {
				this.setData({
					isLoad: true
				});
			});
		}

		if (options && options.title) {
			let title = decodeURIComponent(options.title);
			this.setData({
				title,
				titleEn: options.title
			});
			wx.setNavigationBarTitle({
				title: '项目名单 - ' + title
			});
		}
	},

	/**
* 生命周期函数--监听页面初次渲染完成
*/
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	url: async function (e) {
		pageHelper.url(e, this);
	},

	bindUnFoldTap: function (e) {
		let idx = pageHelper.dataset(e, 'idx');
		let dataList = this.data.dataList;
		dataList.list[idx].fold = false;
		this.setData({
			dataList
		});
	},

	bindFoldTap: function (e) {
		let idx = pageHelper.dataset(e, 'idx');
		let dataList = this.data.dataList;
		dataList.list[idx].fold = true;
		this.setData({
			dataList
		});
	},

	bindFoldAllTap: function (e) {
		let dataList = this.data.dataList;
		for (let k = 0; k < dataList.list.length; k++) {
			dataList.list[k].fold = true;
		}
		this.setData({
			isAllFold: true,
			dataList
		});
	},

	bindUnFoldAllTap: function (e) {
		let dataList = this.data.dataList;
		for (let k = 0; k < dataList.list.length; k++) {
			dataList.list[k].fold = false;
		}
		this.setData({
			isAllFold: false,
			dataList
		});
	},

	bindCopyTap: function (e) {
		let idx = pageHelper.dataset(e, 'idx');
		let forms = this.data.dataList.list[idx].ACTIVITY_JOIN_FORMS;

		let ret = '';

		if (this.data.title)
			ret += `项目：${this.data.title}\r`;

		for (let k = 0; k < forms.length; k++) {
			ret += forms[k].title + '：' + forms[k].val + '\r';
		}
		wx.setClipboardData({
			data: ret,
			success(res) {
				wx.getClipboardData({
					success(res) {
						pageHelper.showSuccToast('已复制到剪贴板');
					}
				})
			}
		});

	},

	bindCancelTap: function (e) {
		this.setData({
			formReason: cacheHelper.get(CACHE_CANCEL_REASON) || '',
			curIdx: pageHelper.dataset(e, 'idx'),
			cancelModalShow: true
		});
	},

	bindCancelCmpt: async function () {
		let e = {
			currentTarget: {
				dataset: {
					status: 99,
					idx: this.data.curIdx
				}
			}
		}
		cacheHelper.set(CACHE_CANCEL_REASON, this.data.formReason, 86400 * 365);
		await this.bindStatusTap(e);
	},

	bindStatusTap: async function (e) {
		let status = Number(pageHelper.dataset(e, 'status'));

		if (status == 99 && !this.data.formReason)
			return pageHelper.showModal('请填写审核不过的理由~');

		let callback = async () => {
			let idx = Number(pageHelper.dataset(e, 'idx'));
			let dataList = this.data.dataList;
			let activityJoinId = dataList.list[idx]._id;
			let params = {
				activityJoinId,
				status,
				reason: this.data.formReason
			}
			let opts = {
				title: '处理中'
			}
			try {
				await cloudHelper.callCloudSumbit('admin/activity_join_status', params, opts).then(res => {
					pageHelper.showSuccToast('操作成功', 1000);

					dataList.list[idx].ACTIVITY_JOIN_REASON = this.data.formReason;
					dataList.list[idx].ACTIVITY_JOIN_STATUS = status;

					this.setData({
						cancelModalShow: false,
						formReason: '',
						curIdx: -1,
						dataList
					});

				});
			} catch (err) {
				console.error(err);
			}
		}

		switch (status) {
			case 99:
				await callback();
				break;
			case 1: {
				pageHelper.showConfirm('确认变更为「审核成功」状态？', callback);
				break;
			}
		}

	},

	bindCommListCmpt: function (e) {

		if (helper.isDefined(e.detail.search))
			this.setData({
				search: '',
				sortType: '',
			});
		else {
			let dataList = e.detail.dataList;
			if (dataList) {
				for (let k = 0; k < dataList.list.length; k++) {
					dataList.list[k].fold = this.data.isAllFold;
				}
			}

			this.setData({
				dataList,
			});
			if (e.detail.sortType)
				this.setData({
					sortType: e.detail.sortType,
				});
		}

	},

	// 修改与展示状态菜单
	_getSearchMenu: function () {

		let sortItems = [];
		let sortMenus = [
			{ label: '全部', type: '', value: '' },
			{ label: `待审核`, type: 'status', value: 0 },
			{ label: `审核成功`, type: 'status', value: 1 },
			{ label: `审核未过`, type: 'status', value: 99 },
		];
		this.setData({
			sortItems,
			sortMenus
		})


	},

	bindClearReasonTap: function (e) {
		this.setData({
			formReason: ''
		})
	}


})