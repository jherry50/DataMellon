import React, {useState, useEffect} from "react";
import { Grid, Card, CardHeader, Divider, CircularProgress, } from '@material-ui/core';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, LineChart, Line, } from 'recharts';
import axios from "axios";
import moment from 'moment';
import MUIDataTable from "mui-datatables";
import { makeStyles } from '@material-ui/core/styles';

import Header from '../component/header';


const useStyles = makeStyles(theme => ({
    root: {
        margin: '4rem 2rem 1rem 2rem'
    },
    loaderContainer: {
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    label: {
      marginLeft: theme.spacing(1)
    },
    cardTitle: {
        fontWeight: 600,
        lineHeight: '30px',
        fontSize: '16px',
        color: '#0e0e0e'
    },
   
}));

const COLORS = ['#4385F4', '#73B047', '#F95738', '#777278'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Dashboard =()=>{
    const classes = useStyles();

    const [loader, setLoader] = useState(true);
    const [chartData, setChartData] = useState([]);

    const [ supplies, setSupplies] = useState([]);
    const [ categories, setCategories] = useState([]);
    const [ regions, setRegions] = useState([]);
    
    const [years, setYears] = useState([]);
    const [timeSeries, setTimeSeries] = useState([]);
 

    const columns = [
        {
          name: "S/N",
          options: {
            filter: false,
            customBodyRender: (value, tableMeta) => {
              return <span style={{fontWeight: 'bold'}}>{tableMeta.rowIndex + 1}</span>;
            },
          },
        },
        "Product Name",
        "Category",
        "Customer Name",
        "State",
        "Region",
        {
            name: "Order Date",
            options: {
                filter: false,
                customBodyRender: (value, tableMeta) => {
                return moment(value).format("MMM DD YYYY");
                },
            },
        },
        {
            name: "Shipment Date",
            options: {
                filter: false,
                customBodyRender: (value, tableMeta) => {
                return moment(value).format("MMM DD YYYY");
                },
            },
        },
    ];

    // To populate table data
    useEffect(() => {
        const createTableData = () => {
          let tableData = []  
  
          chartData.map(val => {
            let row = [
                "",
                `${val["Product Name"]}`,
                `${val.Category}`,
                `${val["Customer Name"]}`,
                `${val.State}`,
                `${val.Region}`,
                `${val["Order Date"]}`,
                `${val["Ship Date"]}`
            ];
            return tableData.push(row);
            
            });
            setSupplies(tableData)
            setLoader(false);
        }
        chartData.length !== 0 && createTableData()
      }, [chartData]);

    function checkYearData(a, b){
        if(a.year < b.year){
            return -1
        }
        if(a.year > b.year){
            return 0;
        }
    }

    //This is an effect to fetch the news api on page load
    useEffect(()=>{
        debugger
        let body = { "angular_test": "angular-developer" };
        axios.post('https://g54qw205uk.execute-api.eu-west-1.amazonaws.com/DEV/stub', body)
            .then(function (response) {
                // handle success
                setChartData(response.data);
                setLoader(false);

                //extract data by Region
                let tempRegion = regions;
                response.data.forEach(supply => {
                    if(!tempRegion.length){
                        tempRegion.push({name: supply.Region, categorySupplies: 1})
                        return true;
                    }
                    tempRegion.every((savedRegion, index, arr)=>{
                        if(savedRegion.name === supply.Region){
                            savedRegion = {...savedRegion, categorySupplies: savedRegion.categorySupplies +1}
                            let newTempRegion = [...tempRegion];
                            newTempRegion[index] = savedRegion;
                            tempRegion = [...newTempRegion]
                            return false;
                        }
                        
                        if(savedRegion.name !== supply.Region && index+1 === arr.length ){
                            tempRegion.push({name: supply.Region, categorySupplies: 1})
                            return false;
                        }
                        return true;
                    })
                });
                setRegions([...tempRegion ])


                //extract data by category
                let tempCat = categories;
                response.data.forEach(supply => {
                    if(!tempCat.length){
                        tempCat.push({name: supply.Category, categorySupplies: 1})
                        return true;
                    }
                    tempCat.every((savedCategory, index, arr)=>{
                        if(savedCategory.name === supply.Category){
                            savedCategory = {...savedCategory, categorySupplies: savedCategory.categorySupplies +1}
                            let newTempCat = [...tempCat];
                            newTempCat[index] = savedCategory;
                            tempCat = [...newTempCat]
                            return false;
                        }
                        
                        if(savedCategory.name !== supply.Category && index+1 === arr.length ){
                            tempCat.push({name: supply.Category, categorySupplies: 1})
                            return false;
                        }
                        return true;
                    })
                });
                setCategories([...tempCat ])
            
                //extract data by year
                let tempYears = years;
                response.data.forEach(supply => {
                    if(!tempYears.length){
                        tempYears.push({year: moment(supply["Order Date"]).format('YYYY'), [supply.Category]: 1})
                        return true;
                    }

                    tempYears.every((savedYear, index, arr)=>{
                        if(savedYear.year === moment(supply["Order Date"]).format('YYYY')){
                            let totalKeys = [];
                            let keys = Object.keys(savedYear)
                            let returnedKeys = keys.filter((key)=>{
                                return key !== 'year'
                            })
                            totalKeys = [...totalKeys, ...returnedKeys]
                            totalKeys.every((cat, indx,ar)=>{
                                if(cat === supply.Category){
                                    savedYear = {...savedYear, [cat]: +savedYear[cat] +1} 
                                    let newTempCat = [...tempYears];
                                    newTempCat[index] = savedYear;
                                    tempYears = [...newTempCat]
                                    return false;
                                }

                                if(cat !== supply.Category && indx+1 === ar.length){
                                    savedYear = {...savedYear, [supply.Category]: 1}
                                    let newTempCat = [...tempYears];
                                    newTempCat[index] = savedYear;
                                    tempYears = [...newTempCat]
                                }
                                return true;
                            })
                            return false;
                        }
                    
                        if(savedYear.year !== moment(supply["Order Date"]).format('YYYY') && index+1 === arr.length ){
                            tempYears.push({year: moment(supply["Order Date"]).format('YYYY'), [supply.Category]: 1})
                            return false;
                        }
                        return true;
                    })
                });

                tempYears = tempYears.sort(checkYearData);
                setYears([...tempYears])

                //format timeSeries data
                let timeSeries = tempYears.map((ele) => {
                    return {name: ele.year, sales: ele.Technology + ele['Office Supplies'] + ele.Furniture}
                })
                setTimeSeries(timeSeries);
             })
            .catch(function (error) {
                // handle error
                console.log(error);
                alert('Error occured in loading All Data');
                setLoader(false);
            })
            .then(function () {
                setLoader(false);
                // always executed
            });
            //eslint-disable-next-line
    },[])
  
      
    return(
        <div>
            {
                loader ? 
                <div className={classes.loaderContainer}>
                    <CircularProgress color="success"/>
                </div> 
                : 
                <>
                     <Header/>
                    <div className="dashboardContainer">
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardHeader title="Sales by category over four years" classes={classes.cardTitle} />
                                    <Divider />
                                    <ResponsiveContainer width="100%" aspect={2}>
                                        <BarChart width={500} height={300} data={years} margin={{ top: 5, right: 30, left: 20, bottom: 5,}}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="year" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="Office Supplies" fill="#4385F4" />
                                            <Bar dataKey="Furniture" fill="#73B047" />
                                            <Bar dataKey="Technology" fill="#F95738" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardHeader title="Sales time series over four years" classes={classes.cardTitle} />
                                    <Divider />
                                    <ResponsiveContainer width="100%" aspect={2}>
                                        <LineChart width={500} height={300} data={timeSeries} margin={{ top: 5, right: 30, left: 20, bottom: 5,}}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="sales" stroke="#F95738" activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Grid>
                         
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardHeader title="Sales occurence in regions" classes={classes.cardTitle} />
                                    <Divider />
                                    <ResponsiveContainer width="100%" aspect={2}>
                                        <PieChart width={500} height={300}>
                                            <Pie data={regions} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} outerRadius={80} fill="#8884d8" dataKey="categorySupplies">
                                                {regions.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardHeader title="Sales by category over four years" classes={classes.cardTitle} />
                                    <Divider />
                                    <ResponsiveContainer width="100%" aspect={2}>
                                        <BarChart width={500} height={300} data={years} margin={{ top: 5, right: 30, left: 20, bottom: 5,}}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="year" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="Office Supplies" stackId="a" fill="#4385F4" />
                                            <Bar dataKey="Furniture" stackId="a" fill="#73B047" />
                                            <Bar dataKey="Technology" stackId="a" fill="#F95738" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Grid>

                            <Grid item xs={12}>
                                <MUIDataTable
                                    title="Sales Table"
                                    data={supplies}
                                    columns={columns}
                                    options={{
                                        selectableRows: "none",
                                        selectableRowsHeader: false,
                                        elevation: 3,
                                        jumpToPage: true,
                                        print: false,
                                        download: false,
                                        textLabels: {
                                            body: {
                                                noMatch: (
                                                    "Sorry, there is no matching data to display"
                                                ),
                                            },
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </div>
                </>
            }
           
        </div>
    )
}

export default Dashboard;