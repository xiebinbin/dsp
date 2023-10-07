import { CardDataResponse } from "@/api/dashboard";
import { FireFilled, ProjectFilled, TeamOutlined, ToolFilled } from "@ant-design/icons";
import { PageContainer, ProCard, ProForm } from "@ant-design/pro-components";
import { useSafeState } from "ahooks";
import { Col, Row } from "antd";
import { useCallback, useEffect } from "react";
import DashboardAPI from "@/api/dashboard.ts";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { AuthInfo } from "@/stores/auth-info";
import App from "@/App.tsx";

export interface DashbordPageProps {
  role: "Root" | "Agent" | "Advertiser";
  roleName: string;
}

const DashboardPage = (props: DashbordPageProps) => {
  const { role, roleName } = props;
  const [infoData, setInfoData] = useSafeState<CardDataResponse | null>(null);
  const [authUser] = useRecoilState(AuthInfo);
  const navigate = useNavigate();
  const loadInfo = useCallback(async () => {
    // 在此处发起数据请求，并将数据存储在 infoData 中
    try {
      const response = await DashboardAPI.getChartData();
      setInfoData(response);
    } catch (error) {
   
      console.error("Error loading data:", error);
    }
  }, [setInfoData]);

  useEffect(() => {
    loadInfo();
  }, [loadInfo]);


  const renderContent = () => {

    if (authUser.role== "Root"||authUser.role == "Operator") {

      return (
        <div>
          <ProForm.Group style={{ margin: "64px" }}>
            <div style={{ flexDirection: "column" }}>
              <Row gutter={16} style={{ flexWrap: "wrap" }}>
                <Col className="level1" style={{}}>
                  <ProCard
                    title={
                      <span>
                        <TeamOutlined style={{ marginRight: 8 }} />
                        人数
                      </span>
                    }
                    headerBordered
                    style={{
                      textAlign: "left",
                      fontSize: 22,
                      width: 350,
                      height: 180,
                      boxShadow: "0 0 2px 3px rgba(147,197,253,0.5)",
                      whiteSpace: "nowrap",
                    }}
                    boxShadow
                  >
                    {infoData ? (
                      <>
                        <div>代理商: {infoData.agentNumber || 0}</div>
                        <div>广告主: {infoData.advertiserNumber || 0}</div>
                      </>
                    ) : (
                      <>
                        <div>代理商: 0</div>
                        <div>广告主: 0</div>
                      </>
                    )}
                  </ProCard>
                </Col>
                <Col style={{}}>
                  <ProCard
                    title={
                      <span>
                        <ToolFilled style={{ marginRight: 8 }} />
                        PV
                      </span>
                    }
                    headerBordered
                    style={{
                      textAlign: "left",
                      marginLeft: "64px",
                      fontSize: 22,
                      width: 350,
                      height: 180,
                      whiteSpace: "nowrap",
                      boxShadow: "0 0 2px 3px rgba(147,197,253,0.5)",
                    }}
                    boxShadow
                  >
                    {infoData ? (
                      <>
                        <div>今日计划PV: {infoData.todayPV || 0}</div>
                        <div>昨日计划PV: {infoData.yesterdayPV || 0}</div>
                      </>
                    ) : (
                      <>
                        <div>今日计划PV: 0</div>
                        <div>昨日计划PV: 0</div>
                      </>
                    )}
                  </ProCard>
                </Col>
              </Row>
              <Row className="level2" gutter={16} style={{ display: "flex" }}>
                <Col style={{ marginTop: "32px" }}>
                  <ProCard
                    title={
                      <span>
                        <ProjectFilled style={{ marginRight: 8 }} />
                        计划
                      </span>
                    }
                    headerBordered
                    style={{
                      textAlign: "left",
                      fontSize: 22,
                      width: 350, // 设置固定宽度
                      height: 180,
                      whiteSpace: "nowrap",
                      boxShadow: "0 0 2px 3px rgba(147,197,253,0.5)",
                    }}
                    boxShadow
                  >
                    {infoData ? (
                      <>
                        <div>进行中的计划: {infoData.ongoingPlans || 0}</div>
                        <div>已完成的计划: {infoData.completedPlans || 0}</div>
                      </>
                    ) : (
                      <>
                        <div>进行中的计划: 1000</div>
                        <div>已完成的计划: 1000</div>
                      </>
                    )}
                  </ProCard>
                </Col>
                <Col style={{ marginTop: "32px" }}>
                  <ProCard
                    title={
                      <span>
                        <FireFilled style={{ marginRight: 8 }} />
                        创意
                      </span>
                    }
                    style={{
                      textAlign: "left",
                      marginLeft: "64px",
                      width: 350,
                      height: 180,
                      fontSize: 22,
                      whiteSpace: "nowrap",
                      boxShadow: "0 0 2px 3px rgba(147,197,253,0.5)",
                    }}
                    headerBordered
                    boxShadow
                  >
                    {infoData ? (
                      <>
                        <div>广告创意: {infoData.adMaterialNumber}</div>
                      </>
                    ) : (
                      <>
                        <div>广告创意: 0</div>
                      </>
                    )}
                  </ProCard>
                </Col>
              </Row>
            </div>
          </ProForm.Group>
        </div>
      );
    } else if (authUser.role  === "Agent") {
     
      return (
        <div>
          <ProForm.Group style={{ margin: "64px" }}>
            <div style={{ flexDirection: "column" }}>
              <Row gutter={16} style={{ flexWrap: "wrap" }}>
                <Col className="level1" style={{}}>
                  <ProCard
                    title={
                      <span>
                        <TeamOutlined style={{ marginRight: 8 }} />
                        人数
                      </span>
                    }
                    headerBordered
                    style={{
                      textAlign: "left",
                      fontSize: 22,
                      width: 350,
                      height: 180,
                      boxShadow: "0 0 2px 3px rgba(147,197,253,0.5)",
                      whiteSpace: "nowrap",
                    }}
                    boxShadow
                  >
                    {infoData ? (
                      <>
                        <div>广告主: {infoData.advertiserNumber || 0}</div>
                      </>
                    ) : (
                      <>
                        <div>代理商: 0</div>
                        <div>广告主: 0</div>
                      </>
                    )}
                  </ProCard>
                </Col>
                <Col style={{}}>
                  <ProCard
                    title={
                      <span>
                        <ProjectFilled style={{ marginRight: 8 }} />
                        PV
                      </span>
                    }
                    headerBordered
                    style={{
                      textAlign: "left",
                      marginLeft: "64px",
                      fontSize: 22,
                      width: 350,
                      height: 180,
                      whiteSpace: "nowrap",
                      boxShadow: "0 0 2px 3px rgba(147,197,253,0.5)",
                    }}
                    boxShadow
                  >
                    {infoData ? (
                      <>
                        <div>今日计划PV: {infoData.todayPV || 0}</div>
                        <div>昨日计划PV: {infoData.yesterdayPV || 0}</div>
                      </>
                    ) : (
                      <>
                        <div>今日计划PV: 0</div>
                        <div>昨日计划PV: 0</div>
                      </>
                    )}
                  </ProCard>
                </Col>
              </Row>
              <Row className="level2" gutter={16} style={{ display: "flex" }}>
                <Col style={{ marginTop: "32px" }}>
                  <ProCard
                    title={
                      <span>
                        <ProjectFilled style={{ marginRight: 8 }} />
                        计划
                      </span>
                    }
                    headerBordered
                    style={{
                      textAlign: "left",
                      fontSize: 22,
                      width: 350, // 设置固定宽度
                      height: 180,
                      whiteSpace: "nowrap",
                      boxShadow: "0 0 2px 3px rgba(147,197,253,0.5)",
                    }}
                    boxShadow
                  >
                    {infoData ? (
                      <>
                        <div>进行中的计划: {infoData.ongoingPlans || 0}</div>
                        <div>已完成的计划: {infoData.completedPlans || 0}</div>
                      </>
                    ) : (
                      <>
                        <div>进行中的计划: 1000</div>
                        <div>已完成的计划: 1000</div>
                      </>
                    )}
                  </ProCard>
                </Col>
                <Col style={{ marginTop: "32px" }}>
                  <ProCard
                    title={
                      <span>
                        <FireFilled style={{ marginRight: 8 }} />
                        创意
                      </span>
                    }
                    style={{
                      textAlign: "left",
                      marginLeft: "64px",
                      width: 350,
                      height: 180,
                      fontSize: 22,
                      whiteSpace: "nowrap",
                      boxShadow: "0 0 2px 3px rgba(147,197,253,0.5)",
                    }}
                    headerBordered
                    boxShadow
                  >
                    {infoData ? (
                      <>
                        <div>广告创意: {infoData.adMaterialNumber}</div>
                      </>
                    ) : (
                      <>
                        <div>广告创意: 0</div>
                      </>
                    )}
                  </ProCard>
                </Col>
              </Row>
            </div>
          </ProForm.Group>
        </div>
      );
    }
    else{
        navigate("/unauthorized");
        return null;
    }
  };

  return (
    <PageContainer
      token={{
        paddingInlinePageContainerContent: 40,
      }}
      subTitle="实时数据"
    >
      {renderContent()}
      <><App/></>
    </PageContainer>
  );
};
export default DashboardPage;
