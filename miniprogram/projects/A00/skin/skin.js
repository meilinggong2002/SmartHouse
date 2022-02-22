module.exports = {
	PID: 'A00', //楼盘开盘

	NAV_COLOR: '#ffffff',
	NAV_BG: '#333333',

	MEET_NAME: '预约',

	MENU_ITEM: ['首页', '预约看房', '我的'], // 第1,4,5菜单

	NEWS_CATE: '1=最新资讯|rightpic,2=项目介绍,3=微楼书,4=看户型|leftbig3,5=热门活动,6=置业顾问|leftbig2',
	MEET_TYPE: '1=预约看房',

	DEFAULT_FORMS: [{
			type: 'line',
			title: '姓名',
			desc: '请填写您的姓名',
			must: true,
			len: 50,
			onlySet: {
				mode: 'all',
				cnt: -1
			},
			selectOptions: ['', ''],
			mobileTruth: true,
			checkBoxLimit: 2,
		},
		{
			type: 'line',
			title: '手机',
			desc: '请填写您的手机号码',
			must: true,
			len: 50,
			onlySet: {
				mode: 'all',
				cnt: -1
			},
			selectOptions: ['', ''],
			mobileTruth: true,
			checkBoxLimit: 2,
		}
	]
}