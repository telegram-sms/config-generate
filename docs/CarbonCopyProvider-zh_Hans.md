# 如何新增一个 Carbon Copy Provider

> If you need the English version of this tutorial, please refer to [here](./CarbonCopyProvider.md)

## 简介
本文档介绍了实现新 Carbon Copy Provider 的步骤。若您不熟悉 Carbon Copy Provider，请先查看 README 中的 [Carbon Copy Provider](../README.md#carbon-copy-provider) 章节。

项目中已有一些 Carbon Copy Providers 的示例。您可以在 `src/providers` 目录下找到 `template.tsx`。实现一个新 Carbon Copy Provider 主要包括两个部分：
1. 实现 Provider 配置项。
2. 实现 Provider 的请求 HAR。

## 实现 Provider 配置项
Provider 配置项是用户在 Carbon Copy Provider 中需要提供的配置，用于根据 Provider 的 API 生成请求 HAR，并在界面中展示给用户填写。

若要实现 Provider 配置项，需要在 `src/carbon_copy` 目录中新建一个名为 `providerName.tsx` 的文件，并在其中导出一个用于显示 Provider 配置表单的 React 组件。

您需要修改的内容：

### 类名（Provider 名称）
将类名改为您的 Provider 名称，格式应为 `ProviderName`。

```tsx
import InputDialog from "../components/InputDialog";
import DataDisplay from "../components/DataDisplay";

function ProviderName () {
```

文件底部的默认导出也应改为该类名：
```tsx
export default ProviderName;
```

### 需要定义的常量
您需要在文件中定义配置项常量，类似以下示例：

```tsx
import InputDialog from "../components/InputDialog";
import DataDisplay from "../components/DataDisplay";

function ProviderName () {
    // State Carbon Copy Provider Options

    const [server, setServer] = useState(""); // 用作服务器 URL
    const [apiKey, setApiKey] = useState(""); // 用作 API key
    ...

    // Provider Options Ends here
```

定义常量时需要注意：
1. 使用 `useState` 钩子来定义常量。
2. 格式应为 `const [constantName, setConstantName] = useState("");`。
3. `constantName` 要使用 camelCase 命名。
4. `constantName` 要能清晰描述所代表的配置项。
5. 在 “Carbon Copy Provider Options Display” 部分使用这些常量获取用户输入。

### 显示 Carbon Copy Provider 配置选项
需要在一个输入表单中展示配置选项，可以使用 `TextField` 组件：

```tsx
<TextField
    type="text"
    value={server}
    onChange={event => {
        setServer(event.target.value.trim());
    }}
    label="Webhook URL"
    variant="outlined"
    required
/>
```

需要注意：
1. 使用 `TextField` 组件来展示选项。
2. `TextField` 组件应包含以下属性：
    - `type`: 输入字段类型。
    - `value`: 输入字段的值。
    - `onChange`: 处理输入更新的函数。
    - `label`: 输入字段标签。
    - `variant`: 组件风格。
    - `required`: 是否为必填项。

### 为 Provider 定义 HAR 数据结构
您需要为该 Provider 定义一个 HAR 数据结构，格式如下：

```tsx
function getFormData () {
    const formData: {
        name: string;
        enabled: boolean;
        har: HAR;
    } = {
        name: "Lark", // 在应用中展示的 Carbon Copy Provider 名称
        enabled: true,
        har: {
            log: {
                version: "1.2",
                entries: [
                    {
                        request: {
                            method: "POST", // 若使用 POST 请求需添加 postData，否则留空
                            url: server,
                            httpVersion: "HTTP/1.1",
                            headers: [
                                {
                                    name: "Content-Type",
                                    value: "application/json",
                                },
                                {
                                    name: "Accept",
                                    value: "application/json",
                                },
                            ],
                            queryString: [],
                            cookies: [],
                            headersSize: -1,
                            bodySize: -1,
                            postData: {
                                mimeType: "application/json",
                                text: JSON.stringify({
                                    msg_type: "post",
                                    content: {
                                        post: {
                                            en_us: {
                                                title: "{{Title}}",
                                                content: [
                                                    [
                                                        {
                                                            tag: "text",
                                                            text: "{{Message}}",
                                                        },
                                                    ],
                                                ],
                                            },
                                        },
                                    },
                                }),
                            },
                        },
                    },
                ],
            },
        },
    };
    return formData;
}
```

若不确定为该 Provider 设置什么样的 HAR 数据，可使用 [cURL](https://config.telegram-sms.com/carbon-copy) 来查看 HAR Data。  
请记住，{{Title}}、{{Message}} 和 {{Copy}} 是在用户发送短信时填充的占位符。{{Copy}} 会从 {{Message}} 中提取用于复制的验证码。某些 Provider 支持“点击复制”功能，可参阅 [Bark](../src/carbon-copy/bark.tsx) 示例。

### 自定义函数
在某些情况下，您可能需要实现自定义函数来处理配置项（例如 Provider 向用户提供一个 URL，而用户需要从中提取 API key）。可以参考 [bark.tsx](../src/carbon_copy/bark.tsx) 中的示例：

```tsx
function extractHostAndKey(url: string) {
    const urlObj = new URL(url);
    const host = urlObj.hostname;
    const key = urlObj.pathname.split('/')[1];
    return {host, key};
}
```

## 将 Provider 添加到 Provider 列表
您需要在 `src/CarbnCopy.tsx` 文件中将该 Provider 添加到列表中，如下所示：

```tsx
    const tabLabels = ["Curl", "Bark", "Lark (Feishu)", "Pushdeer", "Gotify"];
    // const tabLabels = ["Curl", "Bark", "Lark (Feishu)", "Pushdeer", "Gotify", "Template"];
```

然后在 `Tabs` 和 `CustomTabPanel` 中添加该 Provider，示例如下：

```tsx
    <Tabs value={value} onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="basic tabs example">
        <Tab label={tabLabels[0]} {...a11yProps(0)} />
        <Tab label={tabLabels[1]} {...a11yProps(1)} />
        <Tab label={tabLabels[2]} {...a11yProps(2)} />
        <Tab label={tabLabels[3]} {...a11yProps(3)} />
        <Tab label={tabLabels[4]} {...a11yProps(4)} />
        {/* <Tab label={tabLabels[5]} {...a11yProps(5)} /> */}
    </Tabs>
    <CustomTabPanel value={value} index={0}>
        <Curl/>
    </CustomTabPanel>
    <CustomTabPanel value={value} index={1}>
        <Bark/>
    </CustomTabPanel>
    <CustomTabPanel value={value} index={2}>
        <Lark/>
    </CustomTabPanel>
    <CustomTabPanel value={value} index={3}>
        <PushDeer/>
    </CustomTabPanel>
    <CustomTabPanel value={value} index={4}>
        <Gotify/>
    </CustomTabPanel>
    {/* <CustomTabPanel value={value} index={5}>
        <Template/>
    </CustomTabPanel> */}
```