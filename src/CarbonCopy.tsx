import React, { useState } from "react";
import { Tab, Tabs, Box } from "@mui/material";
import Bark from "./carbon_copy/bark";
import CustomTabPanel from "./components/CustomTabPanel";
import Lark from "./carbon_copy/lark";


const CarbonCopy: React.FC = () => {
    const [value, setValue] = useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const a11yProps = (index: number) => {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    };

    return (
        <div>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Bark" {...a11yProps(0)} />
                    <Tab label="Lark (Feishu)" {...a11yProps(1)} />
                    <Tab label="DingTalk (DingDing)" {...a11yProps(2)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <Bark />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <Lark />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                Item Three
            </CustomTabPanel>
        </div>
    );
}

export default CarbonCopy;