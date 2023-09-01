import {PageContainer} from "@ant-design/pro-components";

const DashboardPage = () => {
    return (

        <PageContainer
            token={{
                paddingInlinePageContainerContent: 40,
            }}
            subTitle="简单的描述"
        >
            <div>
                今日新增用户
                昨日新增用户
                总用户

                今日新增订单
                昨日新增订单
                总订单

                今日新增收入
                昨日新增收入
                总收入

                昨日新增分成
                累计分成

                今日新增提现
                昨日新增提现
                总提现
            </div>
        </PageContainer>
    )
}

export default DashboardPage;
