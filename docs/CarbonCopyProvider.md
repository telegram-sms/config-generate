# How to implement new Carbon Copy Provider

> 简体中文教程请参考[这里](./CarbonCopyProvider-zh_Hans.md)

## Introduction
This document describes the steps to implement a new Carbon Copy Provider.
If you are not familiar with the Carbon Copy Provider, please refer to the [Carbon Copy Provider](../README.md#carbon-copy-provider) section in the README.

There have been a few Carbon Copy Providers implemented in the project. You can find a template.tsx in the `src/providers` directory.
There are two main parts to implement a new Carbon Copy Provider:
1. Implement the provider options.
2. Implement the provider request HAR.

## Implement the provider options
The provider options are the configuration that the user needs to provide to the Carbon Copy Provider. They are used to generate the request HAR according to the provider's API. It is also shown in the user interface for the user to fill in.

To implement the provider options, you need to create a new file in the `src/carbon_copy` directory. The file should be named as `providerName.tsx`. The file should export a React component that shows the provider config generation form.

Things you need to modify in the file:

### Class names(Provider names)

Change the class name to the provider name. The class name should be in the format of `ProviderName`.

```tsx
import InputDialog from "../components/InputDialog";
import DataDisplay from "../components/DataDisplay";

function ProviderName () {

```

And the default export (at the bottom of the file) should be the class name.

```tsx
export default ProviderName;
```

### Constants to be defined

You need to define the options constants in the file like the following template:

```tsx
import InputDialog from "../components/InputDialog";
import DataDisplay from "../components/DataDisplay";

function ProviderName () {
    // State Carbon Copy Provider Options

    const [server, setServer] = useState(""); // Will be used as the server URL
    const [apiKey, setApiKey] = useState(""); // Will be used as the API key
    ...

    // Provider Options Ends here

```

Consider the following points while defining the constants:
1. The constants should be defined using the `useState` hook.
2. The constants should be defined in the format of `const [constantName, setConstantName] = useState("");`.
3. The `constantName` should be in camelCase.
4. The `constantName` should be descriptive of the option it represents.
5. The `constantName` should be used in the `Carbon Copy Provider Options Display` section to get the user input.

### Carbon Copy Provider Options Display

You need to display the options in the form of an input dialog. You can use the `TextField` component to display the options.

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

Consider the following points while displaying the options:
1. The `TextField` component should be used to display the options.
2. The `TextField` component should have the following props:
    - `type`: The type of the input field.
    - `value`: The value of the input field.
    - `onChange`: The function to handle the change in the input field.
    - `label`: The label of the input field.
    - `variant`: The variant of the input field.
    - `required`: Whether the input field is required or not.

### HAR Data Stucture for the Provider

You need to define the HAR data structure for the provider. The HAR data structure should be in the following format:

```tsx
    function getFormData () {
        const formData: {
            name: string;
            enabled: boolean;
            har: HAR;
        } = {
            name: "Lark", // Carbon Copy Provider Name To be displayed in the App
            enabled: true,
            har: {
                log: {
                    version: "1.2",
                    entries: [
                        {
                            request: {
                                method: "POST", // You have to write postData for POST request, otherwise leave it empty
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

If you are not sure about the HAR data to be set for the provider, you can use the [cURL](https://config.telegram-sms.com/carbon-copy) provider to get the HAR data structure. 

Just remember, {{Title}}, {{Message}} and {{Copy}} are the placeholders that will be replaced by the actual values when the user sends the SMS.
{{Copy}} is the verification code be extracted from {{Message}}. Some providers may have click-to-copy feature, so the user can click the verification code to copy it to the clipboard. Refer to [Bark](../src/carbon-copy/bark.tsx) for an example.

### Custom Functions

In some cases you may need to implement custom functions to handle the options. (e.g. the provider gives the user a URL and the user needs to extract the API key from the URL). You may define the functions in the file like how it is done in [bark.tsx](../src/carbon_copy/bark.tsx).

```tsx
    
    function extractHostAndKey(url: string) {
    const urlObj = new URL(url);
    const host = urlObj.hostname;
    const key = urlObj.pathname.split('/')[1];
    return {host, key};
}

```

## Add the provider to the list

You would need to add the provider to the provider list in the `src/CarbnCopy.tsx` file. 

Add the provider to the list like the following:

```tsx
    const tabLabels = ["Curl", "Bark", "Lark (Feishu)", "Pushdeer", "Gotify"];
    // const tabLabels = ["Curl", "Bark", "Lark (Feishu)", "Pushdeer", "Gotify", "Template"];
```

and add the provider to the `Tabs` and `CustomTabPanel` like the following:

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




