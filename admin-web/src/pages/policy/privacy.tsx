import React from "react";
import {  Typography } from "antd";
import { PageContainer, ProCard } from "@ant-design/pro-components";

const PrivacyPolicyPage: React.FC = () => {
  // 用户服务协议文本
  const termsOfServiceText = `
  生效日期：[2023-10]
  
  1. 介绍
  本隐私政策（以下简称"协议"）旨在说明我们如何收集、使用和保护您的个人信息。请在使用我们的服务之前仔细阅读本协议。
  
  2. 收集的信息
  在提供服务期间，我们可能会收集以下类型的信息：
  
  2.1. 您提供的信息：当您注册帐户、填写表格、与我们联系或使用我们的服务时，您可能需要提供个人信息，例如姓名、电子邮件地址、联系信息等。
  
  2.2. 自动收集的信息：我们的网站和应用程序可能会自动收集某些信息，例如 IP 地址、浏览器类型、设备信息和访问日期和时间。
  
  3. 使用信息
  我们可能会使用您的个人信息用于以下用途：
  
  3.1. 提供服务：向您提供我们的产品和服务，处理交易、帮助您管理帐户。
  
  3.2. 通信：向您发送服务通知、重要信息、营销材料和其他相关信息。
  
  3.3. 改进服务：分析数据以改进我们的产品和服务、用户体验和网站性能。
  
  4. 信息分享
  我们不会出售、出租或分享您的个人信息给第三方，除非经过您的明确同意或法律允许。
  
  5. 安全
  我们采取合理的安全措施以保护您的个人信息。然而，互联网通信不是绝对安全的，因此我们无法保证信息传输的绝对安全性。
  
  6. 隐私权的选择
  您有权访问、更正、删除或限制您的个人信息。您还可以选择不接收我们的营销材料。
  
  7. 未成年人的隐私权
  我们不会故意收集未成年人的个人信息。如果您相信我们可能不慎收集了未成年人的个人信息，请与我们联系，以便我们采取适当的措施。
  
  8. 隐私政策的变更
  我们可能会不时更新本隐私政策。任何重大变更都将在我们的网站上发布，并将在生效前通知您。
  
  9. 联系我们
  如果您对本隐私政策有任何疑问或疑虑，请通过以下联系信息与我们联系：
  
  [您的联系信息]
  
  [公司名称]
  [地址]
  [电话号码]
  [电子邮件地址]
  `;

  return (
    <PageContainer style={{ padding: "24px" }}>
      <div style={{ position: "relative" }}>
        <ProCard
          title={
               <Typography.Title level={2}>隐私协议</Typography.Title>
           }
          type="default"
          bordered={true}
          boxShadow
        >
            <div>
              <pre><h3>{termsOfServiceText}</h3></pre>
            </div>
        </ProCard>
      </div>
    </PageContainer>
  );
};

export default PrivacyPolicyPage;
