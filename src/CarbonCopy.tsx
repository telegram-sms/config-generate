import React, {useEffect, useState} from "react";
import {Tab, Tabs, Box, useMediaQuery} from "@mui/material";
import Bark from "./carbon_copy/bark";
import CustomTabPanel from "./components/CustomTabPanel";
import Lark from "./carbon_copy/lark";
import PushDeer from "./carbon_copy/pushdeer";
import Curl from "./carbon_copy/curl";


const CarbonCopy: React.FC = () => {
    const isNonMobile = useMediaQuery('(min-width:600px)');
    let padding: any = "0px";
    if (!isNonMobile) {
        padding = null;
    }
    const tabLabels = ["Bark", "Lark (Feishu)", "Pushdeer","Curl"];

    const [value, setValue] = useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        document.title = `${tabLabels[value]} - Carbon Copy Config Generator - Telegram SMS`;
    };

    const a11yProps = (index: number) => {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    };

    return (
        <Box sx={[
            (theme) => ({
                maxWidth: "700px",
                margin: "0 auto",
                backgroundColor: theme.palette.configBox.main,
                borderRadius: "1em",
                boxSizing: "border-box",
                padding: "0 1em",
                boxShadow: "rgba(0, 0, 0, .12) .25em .25em 1em .25em",
                color: '#000',
            }),
            (theme) =>
                theme.applyStyles('dark', {
                    maxWidth: "700px",
                    margin: "0 auto",
                    backgroundColor: theme.palette.configBox.dark,
                    borderRadius: "1em",
                    boxSizing: "border-box",
                    padding: "0 1em",
                    boxShadow: "rgba(0, 0, 0, .12) .25em .25em 1em .25em",
                    color: '#fff',
                }),
        ]}>
            <Box sx={{
                textAlign: "center",
                padding: "1em 0",
                lineHeight: "2.2em",
                boxSizing: "border-box",
                borderBottom: "2px dashed #ddd"
            }}>
                <Box sx={{margin: "0", fontSize: "1.7em", fontWeight: 700}}>Carbon Copy Config Generator</Box>
            </Box>
            <Box sx={{
                borderBottom: 1,
                borderColor: 'divider',
                paddingLeft: padding,
                paddingRight: padding,
                paddingBottom: "1.25rem"
            }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label={tabLabels[0]} {...a11yProps(0)} />
                    <Tab label={tabLabels[1]} {...a11yProps(1)} />
                    <Tab label={tabLabels[2]} {...a11yProps(2)} />
                    <Tab label={tabLabels[3]} {...a11yProps(3)} />
                </Tabs>
                <CustomTabPanel value={value} index={0}>
                    <Bark/>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <Lark/>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                    <PushDeer/>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={3}>
                    <Curl />
                </CustomTabPanel>
            </Box>
        </Box>
    );
}

export default CarbonCopy;
