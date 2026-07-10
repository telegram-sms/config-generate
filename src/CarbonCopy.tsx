import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Tab, Tabs, Box, useMediaQuery} from "@mui/material";
import Bark from "./carbon_copy/bark";
import CustomTabPanel from "./components/CustomTabPanel";
import Lark from "./carbon_copy/lark";
import PushDeer from "./carbon_copy/pushdeer";
import Gotify from "./carbon_copy/gotify";
import Curl from "./carbon_copy/curl";
import Ntfy from "./carbon_copy/ntfy";

const tabLabels = ["Curl", "Bark", "Ntfy", "Lark (Feishu)", "Pushdeer", "Gotify"];

const labelToSlug = (label: string): string =>
    label.toLowerCase().split(" ")[0].replace(/[^a-z0-9]/g, "");

const tabSlugs = tabLabels.map(labelToSlug);

const slugToIndex = (slug?: string): number => {
    if (!slug) return 0;
    const normalized = slug.toLowerCase();
    if (normalized === "feishu") return 3;
    const index = tabSlugs.indexOf(normalized);
    return index >= 0 ? index : 0;
};

const CarbonCopy: React.FC = () => {
    const {id} = useParams();
    const isNonMobile = useMediaQuery('(min-width:600px)');
    let padding: any = "0px";
    if (!isNonMobile) {
        padding = null;
    }
    const [value, setValue] = useState(slugToIndex(id));

    useEffect(() => {
        setValue(slugToIndex(id));
    }, [id]);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    document.title = `Carbon Copy Config Generator - Telegram SMS`;
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
                <Tabs value={value} onChange={handleChange}
                      variant="scrollable"
                      scrollButtons="auto"
                      aria-label="basic tabs example">
                    <Tab label={tabLabels[0]} {...a11yProps(0)} />
                    <Tab label={tabLabels[1]} {...a11yProps(1)} />
                    <Tab label={tabLabels[2]} {...a11yProps(2)} />
                    <Tab label={tabLabels[3]} {...a11yProps(3)} />
                    <Tab label={tabLabels[4]} {...a11yProps(4)} />
                    <Tab label={tabLabels[5]} {...a11yProps(5)} />
                </Tabs>
                <CustomTabPanel value={value} index={0}>
                    <Curl/>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <Bark/>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={3}>
                    <Lark/>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={4}>
                    <PushDeer/>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={5}>
                    <Gotify/>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                    <Ntfy/>
                </CustomTabPanel>
            </Box>
        </Box>
    );
}

export default CarbonCopy;
