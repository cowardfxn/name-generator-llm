import React, { useState } from "react";
import {
  Card,
  Form,
  Select,
  Upload,
  Button,
  Input,
  Space,
  message,
  Slider,
  Spin,
  Row,
  Col,
  theme,
  Layout,
  Switch,
  Tooltip,
} from "antd";
import {
  UploadOutlined,
  CopyOutlined,
  SunOutlined,
  MoonOutlined,
  DislikeOutlined,
} from "@ant-design/icons";
import type { NameGeneratorParams, NameResult } from "../types";
import axios from "react";
import { useEffect } from "react";

const { Option } = Select;
const { useToken } = theme;
const { Header } = Layout;

const commonMeanings = [
  "智慧聪颖",
  "品德高尚",
  "健康平安",
  "前程似锦",
  "坚韧不拔",
  "温文尔雅",
  "积极进取",
  "天赋卓越",
];

const culturalSources = [
  "四书五经",
  "诗经楚辞",
  "唐诗宋词",
  "历史典故",
  "道德经",
  "佛经禅语",
];

interface NameGeneratorProps {
  isDarkMode: boolean;
  onThemeChange: () => void;
}

const NameGenerator: React.FC<NameGeneratorProps> = ({
  isDarkMode,
  onThemeChange,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [nameResults, setNameResults] = useState<NameResult[]>([]);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [dislikedNames, setDislikedNames] = useState<Set<string>>(new Set());
  const { token } = useToken();

  // Cleanup event source on unmount
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  const splitString = (str: string | undefined): string[] => {
    if (!str) return [];
    return str
      .split(/[,， ]/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleSelectAll = (
    values: string[],
    options: any[],
    fieldName: string
  ) => {
    if (values.includes("ALL")) {
      form.setFieldsValue({
        [fieldName]: options.filter((opt) => opt !== "ALL"),
      });
    }
  };

  const handleDislike = (name: string) => {
    setDislikedNames((prev) => new Set([...prev, name]));
    message.success("已将该名字标记为不喜欢");
  };

  const onFinish = async (formValues: any) => {
    try {
      setLoading(true);
      setNameResults([]);

      // Close existing event source if any
      if (eventSource) {
        eventSource.close();
      }

      // Process form values
      const processedValues: NameGeneratorParams = {
        ...formValues,
        avoidCharacters: splitString(formValues.avoidCharacters),
        avoidSounds: splitString(formValues.avoidSounds),
        meanings: formValues.meanings?.filter((m: string) => m !== "ALL") || [],
        culturalSource:
          formValues.culturalSource?.filter((c: string) => c !== "ALL") || [],
        count: formValues.count || 3,
        nameLength: formValues.nameLength || "any",
        dislikedNames: Array.from(dislikedNames), // 添加不喜欢的名字列表
      };

      // Start SSE connection
      const newEventSource = new EventSource(
        `/api/generate-name/stream?params=${encodeURIComponent(
          JSON.stringify(processedValues)
        )}`
      );

      newEventSource.onmessage = (event) => {
        const result = JSON.parse(event.data) as NameResult;
        setNameResults((prev) => [...prev, result]);
      };

      newEventSource.onerror = () => {
        newEventSource.close();
        setEventSource(null);
        setLoading(false);
        if (nameResults.length === 0) {
          message.error("生成名字时出现错误，请重试！");
        }
      };

      newEventSource.addEventListener("done", () => {
        newEventSource.close();
        setEventSource(null);
        setLoading(false);
        message.success("名字生成成功！");
      });

      setEventSource(newEventSource);
    } catch (error) {
      setLoading(false);
      message.error("生成名字时出现错误，请重试！");
      console.error("Error generating names:", error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success("复制成功！");
    } catch (err) {
      message.error("复制失败，请手动复制");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          padding: "0 24px",
        }}
      >
        <div
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: token.colorTextHeading,
          }}
        >
          新生儿起名助手
        </div>
        <Space>
          <Switch
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            checked={isDarkMode}
            onChange={onThemeChange}
          />
        </Space>
      </Header>
      <Layout.Content
        style={{
          height: "calc(100vh - 64px)",
          padding: "1rem",
          backgroundColor: token.colorBgLayout,
          overflow: "hidden",
        }}
      >
        <Spin spinning={loading} tip="正在生成名字..." size="large">
          <Row
            gutter={24}
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              height: "100%",
            }}
          >
            <Col span={12} style={{ height: "100%" }}>
              <Card
                title="新生儿起名"
                style={{
                  height: "100%",
                  backgroundColor: token.colorBgContainer,
                  boxShadow: token.boxShadowTertiary,
                  display: "flex",
                  flexDirection: "column",
                }}
                bodyStyle={{
                  flex: 1,
                  overflow: "auto",
                  padding: "16px 24px",
                  maxHeight: "calc(100vh - 184px)", // 减去header高度
                }}
                extra={
                  <Button
                    type="primary"
                    onClick={() => form.submit()}
                    loading={loading}
                  >
                    生成名字
                  </Button>
                }
              >
                <div
                  className="scroll-container"
                  style={{
                    height: "100%",
                    overflowY: "auto",
                    paddingRight: "8px",
                  }}
                >
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    style={{
                      paddingRight: 8,
                    }}
                    initialValues={{
                      nameLength: "any",
                    }}
                  >
                    <Form.Item name="gender" label="性别">
                      <Select placeholder="请选择性别（可选）">
                        <Option value="male">男孩</Option>
                        <Option value="female">女孩</Option>
                        <Option value="neutral">不限</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item name="nameLength" label="名字长度">
                      <Select>
                        <Option value="any">不限</Option>
                        <Option value="single">单字名</Option>
                        <Option value="double">双字名</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="meanings"
                      label="期望寓意"
                      rules={[
                        { required: true, message: "请至少选择一个寓意" },
                      ]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="请选择期望寓意"
                        style={{ width: "100%" }}
                        onChange={(values) =>
                          handleSelectAll(values, commonMeanings, "meanings")
                        }
                      >
                        <Option key="ALL" value="ALL">
                          全选
                        </Option>
                        {commonMeanings.map((meaning) => (
                          <Option key={meaning} value={meaning}>
                            {meaning}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item label="自定义寓意">
                      <Upload
                        beforeUpload={(file) => {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            try {
                              const content = e.target?.result as string;
                              const meanings = content
                                .split(/\r?\n/)
                                .filter((line) => line.trim());
                              const currentMeanings =
                                form
                                  .getFieldValue("meanings")
                                  ?.filter((m: string) => m !== "ALL") || [];
                              form.setFieldsValue({
                                meanings: [...currentMeanings, ...meanings],
                              });
                              message.success("寓意导入成功");
                            } catch (error) {
                              message.error("文件格式不正确");
                            }
                          };
                          reader.readAsText(file);
                          return false;
                        }}
                        accept=".txt"
                        maxCount={1}
                        showUploadList={false}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          style={{
                            borderColor: token.colorBorder,
                          }}
                        >
                          上传自定义寓意文件
                        </Button>
                      </Upload>
                    </Form.Item>

                    <Form.Item
                      name="culturalSource"
                      label="文化溯源"
                      rules={[
                        { required: true, message: "请至少选择一个文化来源" },
                      ]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="请选择文化溯源"
                        style={{ width: "100%" }}
                        onChange={(values) =>
                          handleSelectAll(
                            values,
                            culturalSources,
                            "culturalSource"
                          )
                        }
                      >
                        <Option key="ALL" value="ALL">
                          全选
                        </Option>
                        {culturalSources.map((source) => (
                          <Option key={source} value={source}>
                            {source}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item name="count" label="生成数量" initialValue={3}>
                      <Slider
                        min={3}
                        max={20}
                        marks={{
                          3: "3个",
                          10: "10个",
                          20: "20个",
                        }}
                        style={{ margin: "0 10px" }}
                      />
                    </Form.Item>

                    <Form.Item name="avoidCharacters" label="回避字">
                      <Input.TextArea
                        placeholder="请输入需要回避的汉字，用逗号分隔"
                        autoSize={{ minRows: 2 }}
                        style={{
                          backgroundColor: token.colorBgContainer,
                          borderColor: token.colorBorder,
                        }}
                      />
                    </Form.Item>

                    <Form.Item name="avoidSounds" label="回避读音">
                      <Input.TextArea
                        placeholder="请输入需要回避的读音，用逗号分隔"
                        autoSize={{ minRows: 2 }}
                        style={{
                          backgroundColor: token.colorBgContainer,
                          borderColor: token.colorBorder,
                        }}
                      />
                    </Form.Item>
                  </Form>
                </div>
              </Card>
            </Col>

            <Col span={12} style={{ height: "100%" }}>
              <Card
                title="生成结果"
                style={{
                  height: "100%",
                  backgroundColor: token.colorBgContainer,
                  boxShadow: token.boxShadowTertiary,
                  display: "flex",
                  flexDirection: "column",
                }}
                bodyStyle={{
                  flex: 1,
                  overflow: "auto",
                  padding: "16px 24px",
                  maxHeight: "calc(100vh - 184px)", // 减去header高度
                }}
              >
                <div
                  className="scroll-container"
                  style={{
                    height: "100%",
                    paddingRight: "8px",
                  }}
                >
                  {nameResults.length > 0 ? (
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {nameResults.map((result, index) => (
                        <Card
                          key={index}
                          size="small"
                          title={
                            <span
                              style={{
                                fontSize: "16px",
                                fontWeight: 600,
                                color: token.colorTextHeading,
                              }}
                            >
                              {result.name}
                            </span>
                          }
                          style={{
                            marginBottom: 8,
                            backgroundColor: token.colorBgElevated,
                            borderColor: token.colorBorderSecondary,
                          }}
                          extra={
                            <Space>
                              <Tooltip title="标记为不喜欢">
                                <Button
                                  icon={<DislikeOutlined />}
                                  type="text"
                                  onClick={() => handleDislike(result.name)}
                                  disabled={dislikedNames.has(result.name)}
                                />
                              </Tooltip>
                              <Button
                                icon={<CopyOutlined />}
                                type="text"
                                onClick={() =>
                                  copyToClipboard(
                                    `名字：${result.name}\n性别：${
                                      result.gender === "male"
                                        ? "男"
                                        : result.gender === "female"
                                        ? "女"
                                        : "中性"
                                    }\n寓意：${result.meaning.join(
                                      "、"
                                    )}\n出处：${result.source}\n释义：${
                                      result.explanation
                                    }`
                                  )
                                }
                              >
                                复制
                              </Button>
                            </Space>
                          }
                        >
                          <p
                            style={{
                              color: token.colorTextSecondary,
                              marginBottom: token.marginXS,
                            }}
                          >
                            性别：
                            {result.gender === "male"
                              ? "男"
                              : result.gender === "female"
                              ? "女"
                              : "中性"}
                          </p>
                          <p
                            style={{
                              color: token.colorTextSecondary,
                              marginBottom: token.marginXS,
                            }}
                          >
                            寓意：{result.meaning.join("、")}
                          </p>
                          <p
                            style={{
                              color: token.colorTextSecondary,
                              marginBottom: token.marginXS,
                            }}
                          >
                            出处：{result.source}
                          </p>
                          <p
                            style={{
                              color: token.colorTextSecondary,
                              marginBottom: 0,
                            }}
                          >
                            释义：{result.explanation}
                          </p>
                        </Card>
                      ))}
                    </Space>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: token.colorTextSecondary,
                      }}
                    >
                      尚未生成任何名字
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </Spin>
      </Layout.Content>
    </Layout>
  );
};

export default NameGenerator;
