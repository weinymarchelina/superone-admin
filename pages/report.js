import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  IconButton,
  TextField,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

// const idLocale = require("moment/locale/id");
// moment.locale("id", idLocale);

const DisplayReport = ({ user }) => {
  const router = useRouter();

  const startHours = moment(new Date()).startOf("day").toISOString();
  const endHours = moment(new Date()).endOf("day").toISOString();
  const thisWeekStart = moment(new Date()).startOf("week").toISOString();
  const thisWeekEnd = moment(new Date()).endOf("week").toISOString();
  const thisMonthStart = moment(new Date()).startOf("month").toISOString();
  const thisMonthEnd = moment(new Date()).endOf("month").toISOString();
  const prevMonthStart = moment(new Date())
    .subtract(1, "months")
    .startOf("month")
    .toISOString();
  const prevMonthEnd = moment(new Date())
    .subtract(1, "months")
    .endOf("month")
    .toISOString();

  const showDate = {
    today: moment(new Date()).format("MMM Do"),
    thisWeekStart: moment(new Date()).startOf("week").format("MMM Do"),
    thisWeekEnd: moment(new Date()).endOf("week").format("MMM Do"),
    thisMonthStart: moment(new Date()).startOf("month").format("MMM Do"),
    thisMonthEnd: moment(new Date()).endOf("month").format("MMM Do"),
    prevMonthStart: moment(new Date())
      .subtract(1, "months")
      .startOf("month")
      .format("MMM Do"),
    prevMonthEnd: moment(new Date())
      .subtract(1, "months")
      .endOf("month")
      .format("MMM Do"),
  };

  const [isMain, setIsMain] = useState(true);
  const [user, setUser] = useState({});
  const [report, setReport] = useState(null);
  const [total, setTotal] = useState({});
  const [filter, setFilter] = useState("Today");
  const filterList = [
    `This Week (${showDate.thisWeekStart} - ${showDate.thisWeekEnd})`,
    `This Month (${showDate.thisMonthStart} - ${showDate.thisMonthEnd})`,
    `Last Month (${showDate.prevMonthStart} - ${showDate.prevMonthEnd})`,
    "All",
  ];

  const switchNav = useMediaQuery("(max-width:900px)");
  const matches = useMediaQuery("(max-width:720px)");
  const stacks = useMediaQuery("(max-width:560px)");

  const formatter = new Intl.NumberFormat("id", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  const fetchReport = async (start, end, filter) => {
    try {
      const res = await axios.post("/api/data/report", { start, end, filter });
      const { report } = res.data;
      const subtotal = report
        .map((item) => item.amount)
        .reduce((partialSum, a) => partialSum + a, 0);
      const soldItem = report
        .map((item) => item.buyedQty)
        .reduce((partialSum, a) => partialSum + a, 0);

      setTotal({
        subtotal,
        soldItem,
      });

      setReport(report);
    } catch (err) {
      console.log(err.response?.data);
      throw new Error(err.message);
    }
  };

  useEffect(async () => {
    fetchReport(startHours, endHours, filter);
  }, []);

  const filterReport = (filter) => {
    console.log(filter);

    switch (filter) {
      case `This Week (${showDate.thisWeekStart} - ${showDate.thisWeekEnd})`:
        // setStart(thisWeekStart);
        // setEnd(thisWeekEnd);
        fetchReport(thisWeekStart, thisWeekEnd, filter);

        break;

      case `This Month (${showDate.thisMonthStart} - ${showDate.thisMonthEnd})`:
        // setStart(thisMonthStart);
        // setEnd(thisMonthEnd);
        fetchReport(thisMonthStart, thisMonthEnd, filter);

        break;

      case `Last Month (${showDate.prevMonthStart} - ${showDate.prevMonthEnd})`:
        // setStart(prevMonthStart);
        // setEnd(prevMonthEnd);
        fetchReport(prevMonthStart, prevMonthEnd, filter);

        break;

      case "All":
        fetchReport("", "", filter);

        break;

      default:
        fetchReport(startHours, endHours, filter);
        break;
    }
  };

  return (
    <Container
      sx={{
        pt: 5,
        pb: 5,
      }}
      maxWidth="lg"
    >
      {report && (
        <Box className="f-row" variant="outlined">
          <Box className="f-col" sx={{ width: "100%" }}>
            <Box
              className="f-space"
              sx={{
                mt: 2,
                mb: 1,
                flex: 1,
                alignItems: "center",
              }}
            >
              <Typography
                className="main-title"
                variant={matches ? "h5" : "h4"}
                component="h2"
              >
                Report
              </Typography>
            </Box>
            {report && (
              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent
                  // className={`${matches ? "f-col" : "f-space"}`}
                  sx={{
                    display: "flex",
                    alignItems: "flex-end",
                    py: 3,
                    gap: 3,
                  }}
                >
                  <Box
                    className="f-space"
                    sx={{ flex: 2, gap: 3, width: "100%" }}
                  >
                    <FormControl variant="standard" sx={{ flex: 1 }}>
                      <InputLabel>Filter</InputLabel>
                      <Select
                        value={filter}
                        label="Category"
                        onChange={(e) => {
                          setFilter(e.target.value);
                          filterReport(e.target.value);
                        }}
                      >
                        <MenuItem value="Today">
                          <Typography variant="subtitle1" component="p">
                            {`Today (${showDate.today})`}
                          </Typography>
                        </MenuItem>
                        {filterList.map((filter) => (
                          <MenuItem key={filter} value={filter}>
                            <Typography variant="subtitle1" component="p">
                              {filter}
                            </Typography>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <IconButton sx={{ pt: 0.65, mx: 2 }}>
                    <AccountCircleIcon />
                  </IconButton>
                </CardContent>
              </Card>
            )}
            {report && (
              <>
                <Card
                  variant="outlined"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1,
                    mt: 2,
                  }}
                >
                  <Typography
                    style={{
                      marginRight: `${matches ? "0" : "2rem"}`,
                      letterSpacing: "1px",
                    }}
                    variant={stacks ? "caption" : "body1"}
                    className="main-title"
                  >
                    Total
                  </Typography>

                  <Typography
                    variant={stacks ? "caption" : "body1"}
                    textAlign="right"
                    component="p"
                  >
                    {formatter.format(total.subtotal)}
                  </Typography>
                </Card>
                <Card
                  variant="outlined"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1,
                  }}
                >
                  <Typography
                    style={{
                      marginRight: `${matches ? "0" : "2rem"}`,
                      letterSpacing: "1px",
                    }}
                    variant={stacks ? "caption" : "body1"}
                    className="main-title"
                  >
                    Sold Items
                  </Typography>

                  <Typography
                    variant={stacks ? "caption" : "body1"}
                    textAlign="right"
                    component="p"
                  >
                    {total.soldItem} pcs
                  </Typography>
                </Card>
                <Card
                  variant="outlined"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1,
                  }}
                >
                  <Typography
                    style={{
                      marginRight: `${matches ? "0" : "2rem"}`,
                      letterSpacing: "1px",
                    }}
                    variant={stacks ? "caption" : "body1"}
                    className="main-title"
                  >
                    Products
                  </Typography>

                  <Typography
                    variant={stacks ? "caption" : "body1"}
                    textAlign="right"
                    component="p"
                  >
                    {report.length} Products
                  </Typography>
                </Card>
              </>
            )}
            <Box>
              {report.map((product) => {
                return (
                  <Box
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        opacity: 0.85,
                      },
                    }}
                    key={product._id}
                    onClick={() => router.push(`/store/${product._id}`)}
                  >
                    <Card
                      key={product._id}
                      variant="outlined"
                      sx={{
                        backgroundColor: `${
                          product.stockQty === 0 ? "#aaa" : "transparent"
                        }`,
                      }}
                    >
                      <CardContent className={switchNav ? "f-col" : "f-space"}>
                        <Box className="f-row">
                          <Box>
                            <img
                              src={product.image[0]}
                              alt={`${product.name}-img`}
                              style={{
                                width: `${
                                  stacks ? "3.75rem" : "calc(5rem + 1vw)"
                                }`,
                                height: `${
                                  stacks ? "3.75rem" : "calc(5rem + 1vw)"
                                }`,
                                margin: "0 .5rem",
                                opacity: `${product.stockQty === 0 ? 0.7 : 1}`,
                              }}
                            />
                          </Box>
                          <Box
                            sx={{
                              px: 1,
                              flex: 1,
                              width: `${matches ? "9rem" : "auto"}`,
                            }}
                          >
                            <Typography
                              variant="body1"
                              component="h2"
                              noWrap={matches ? true : false}
                              sx={{ width: "100%" }}
                            >
                              {product.name}
                            </Typography>
                            <Box
                              sx={{ display: "flex", alignItems: "flex-end" }}
                            >
                              <Typography component="p" fontWeight={"bold"}>
                                {formatter.format(product.amount)}
                              </Typography>
                              <Typography
                                sx={{
                                  ml: 1,
                                  mb: 0.25,
                                }}
                                variant="caption"
                                component="p"
                              >
                                {product.buyedQty} pcs sold
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default DisplayReport;

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { user: session.user },
  };
}
