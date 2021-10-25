import React, { Fragment, useEffect, useState } from 'react';
import { Grid, Typography, Card, CardHeader, Divider, CircularProgress, } from '@material-ui/core';
import api from '../middlewares/axiosConfig';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, LineChart, Line, } from 'recharts';
import CategoryIcon from '@material-ui/icons/Category';
import MUIDataTable from "mui-datatables";
import Backdrop from '@material-ui/core/Backdrop';



const useStyles = makeStyles(theme => ({
    root: {
        margin: '4rem 2rem 1rem 2rem'
    },
    content: {
      padding: 0
    },
    item: {
      padding: theme.spacing(3),
      textAlign: 'center',
      [theme.breakpoints.up('md')]: {
        '&:not(:last-of-type)': {
          borderRight: `1px solid ${theme.palette.divider}`
        }
      },
      [theme.breakpoints.down('sm')]: {
        '&:not(:last-of-type)': {
          borderBottom: `1px solid ${theme.palette.divider}`
        }
      }
    },
    valueContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    label: {
      marginLeft: theme.spacing(1)
    },
    titleStyle: {
        fontWeight: 600,
        lineHeight: '30px',
        fontSize: '16px',
        color: '#0e0e0e'
    },
    avatarStyle: {
        border: '1px solid #c5ccc5',
        // fontSize: '30px',
        borderRadius: '5px',
        color: '#4a4c49'
    },
    chartDiv: {
        marginTop: '2rem'
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

const Dashboard = () => {
   
    const [ supplies, setSupplies] = useState([]);
    const [ categories, setCategories] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [ shipments, setShipments] = useState(0);
    // eslint-disable-next-line no-unused-vars
    const [ countries, setCountries] = useState(0);
    const [years, setYears] = useState([]);
    const [timeSeries, setTimeSeries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(true);

    const handleClose = () => {
      setOpen(false);
    };

    const classes = useStyles();

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
        "Order Date",
        "Shipment Date"
    ];
    
    useEffect(() => {
      getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  
    async function getData(){
        setLoading(true);
        let requestBody = { "angular_test": "angular-developer" }      
        try{
            const data = await api.post(`/DEV/stub`, requestBody );
            let tableData = [];
            // console.log(data)
            data.data.forEach((val) => {
                let row = [
                    "",
                    `${val["Product Name"]}`,
                    `${val.Category}`,
                    `${val["Customer Name"]}`,
                    `${val["Order Date"]}`,
                    `${val["Ship Date"]}`
                ];
                tableData.push(row);
            });
            setSupplies(tableData)
            setLoading(false);
            let tempCat = categories;
            data.data.forEach(supply => {
                // debugger;
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
            // setShipments(502)
            // setCountries(6)
            // console.log(data)
            
            // let data2 = [{Category: 'technology', "Order Date": "9/29/2016"},{Category: 'office', "Order Date": "8/19/2017"}, {Category: 'aviation', "Order Date": "3/5/2018"}, {Category: 'office', "Order Date": "9/2/2016"}, {Category: 'aviation', "Order Date": "8/2/2016"},  {Category: 'aviation', "Order Date": "8/8/2016"} ]
            let tempYears = years;
            data.data.forEach(supply => {
                // debugger;
                if(!tempYears.length){
                    tempYears.push({year: moment(supply["Order Date"]).format('YYYY'), [supply.Category]: 1})
                    return true;
                }

                tempYears.every((savedYear, index, arr)=>{
                    if(savedYear.year === moment(supply["Order Date"]).format('YYYY')){
                        let allKeys = [];
                        let keys = Object.keys(savedYear)
                        let returnedKeys = keys.filter((key)=>{
                            return key !== 'year'
                        })
                        allKeys = [...allKeys, ...returnedKeys]
                        // console.log(allKeys)
                        allKeys.every((cat, indx,ar)=>{
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
            tempYears = tempYears.sort(compare);
            setYears([...tempYears])
            let timeSeries = tempYears.map((ele) => {
                return {name: ele.year, supplies: ele.Technology + ele['Office Supplies'] + ele.Furniture}
            })
            console.log(timeSeries);
            console.log(years);

            setTimeSeries(timeSeries);
            handleClose();
        }catch(error){
            alert('Error, Could Not Load Get All Data');
            setLoading(false);
        }
    }

    function compare(a, b){
        if(a.year < b.year){
            return -1
        }
        if(a.year > b.year){
            return 0;
        }
    }


    return(
        <Fragment>
            <Backdrop className={classes.backdrop} open={open} >
                <CircularProgress color="inherit" />
            </Backdrop>
            <div className={classes.root}>
                <Typography variant="h4" gutterBottom> Admin Dashboard </Typography>
                <Grid item xs={12}>
                    <Card>
                        <Grid alignItems="center" container justifyContent="flex-start">
                            <Grid className={classes.item} item md={3} sm={6} xs={12}>
                                <Typography component="h2" gutterBottom variant="overline"> Supplies </Typography>
                            
                                <div className={classes.valueContainer}>
                                    <Typography variant="h3">{supplies.length}</Typography>
                                </div>
                            </Grid>
                            <Grid className={classes.item} item md={3} sm={6} xs={12}>
                                <Typography component="h2" gutterBottom variant="overline"> Categories </Typography>
                            
                                <div className={classes.valueContainer}>
                                    <Typography variant="h3">{categories.length}</Typography>
                                </div>
                            </Grid>
                            <Grid className={classes.item} item md={3} sm={6} xs={12}>
                                <Typography component="h2" gutterBottom variant="overline"> Shipments </Typography>
                            
                                <div className={classes.valueContainer}>
                                    <Typography variant="h3">{shipments}</Typography>
                                </div>
                            </Grid>
                            <Grid className={classes.item} item md={3} sm={6} xs={12}>
                                <Typography component="h2" gutterBottom variant="overline"> Countries </Typography>
                            
                                <div className={classes.valueContainer}>
                                    <Typography variant="h3">{countries}</Typography>
                                </div>
                            </Grid>
                        </Grid>
                        
                    </Card>
                </Grid>

                <Grid container spacing={2} className={classes.chartDiv}>
                    <Grid item xs={12} md={6} xl={4}>
                        <Card>
                            <CardHeader title="Sales by Category" avatar={<CategoryIcon />} classes={{title: classes.titleStyle, avatar: classes.avatarStyle}} />
                            <Divider />
                            <ResponsiveContainer width="100%" aspect={2}>
                                <BarChart width={500} height={300} data={years} margin={{ top: 5, right: 30, left: 20, bottom: 5,}}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Office Supplies" fill="#8884d8" />
                                    <Bar dataKey="Furniture" fill="#B1CF5F" />
                                    <Bar dataKey="Technology" fill="#ff5722" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6} xl={4}>
                        <Card>
                            <CardHeader title="Sales by Category" avatar={<CategoryIcon />} classes={{title: classes.titleStyle, avatar: classes.avatarStyle}} />
                            <Divider />
                            <ResponsiveContainer width="100%" aspect={2}>
                                <BarChart width={500} height={300} data={years} margin={{ top: 5, right: 30, left: 20, bottom: 5,}}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Office Supplies" stackId="a" fill="#8884d8" />
                                    <Bar dataKey="Furniture" stackId="a" fill="#82ca9d" />
                                    <Bar dataKey="Technology" stackId="a" fill="#ff5722" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6} xl={4}>
                        <Card>
                            <CardHeader title="Supplies by Category" avatar={<CategoryIcon />} classes={{title: classes.titleStyle, avatar: classes.avatarStyle}} />
                            <Divider />
                            <ResponsiveContainer width="100%" aspect={2}>
                                <PieChart width={400} height={400}>
                                    <Pie data={categories} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} outerRadius={80} fill="#8884d8" dataKey="categorySupplies">
                                        {categories.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6} xl={4}>
                        <Card>
                            <CardHeader title="Sales by Year" avatar={<CategoryIcon />} classes={{title: classes.titleStyle, avatar: classes.avatarStyle}} />
                            <Divider />
                            <ResponsiveContainer width="100%" aspect={2}>
                                <LineChart width={500} height={300} data={timeSeries} margin={{ top: 5, right: 30, left: 20, bottom: 5,}}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="supplies" stroke="#8884d8" activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Grid>
                </Grid>


                <Grid container spacing={2} className={classes.chartDiv}>
                    <Grid item xs={12}>
                        <MUIDataTable
                            data={supplies}
                            columns={columns}
                            options={{
                                selectableRows: "none",
                                selectableRowsHeader: false,
                                elevation: 3,
                                print: false,
                                download: false,
                                textLabels: {
                                    body: {
                                        noMatch: loading ? (
                                            <CircularProgress />
                                        ) : (
                                            "Sorry, there is no matching data to display"
                                        ),
                                    },
                                },
                            }}
                        />
                    </Grid>
                </Grid>
            </div>
        </Fragment>
    )
}

export default Dashboard;