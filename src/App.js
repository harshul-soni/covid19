import React,{ useState , useEffect} from "react";
import './App.css';
import {MenuItem,FormControl,Select,Card,CardContent} from "@material-ui/core";
import InfoBox from "./InfoBox.js";
import Map from "./Map.js";
import Table from "./Table.js";
import {sortData,prettyPrint} from "./util.js";
import LineGraph from "./LineGraph.js";
import "leaflet/dist/leaflet.css";
import numeral from "numeral";


function App() {
  const [countries,setCountries] = useState([]);
  const [country,setCountry] = useState('worldwide');
  const [countryInfo,setCountryInfo]=useState({});
  const [tableData,setTableData] = useState([]);
  const [mapCenter,setMapCenter]= useState([34.80746,-40.4796]);
  const [mapZoom,setMapZoom]= useState(3);
  const [mapCountries,setMapCountries]=useState([]);
  const [casesType,setCasesType] = useState("cases");

  useEffect(()=>{
    fetch("https://disease.sh/v3/covid-19/all")
    .then((response) => response.json())
    .then((data)=>{
      setCountryInfo(data);
    });
  },[]);

  useEffect(()=>{

    const getCountriesData = async () =>{
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response)=>response.json())
      .then((data)=>{
        const countries=data.map((country) =>(
          {
            name:country.country,
            value:country.countryInfo.iso2
          }
        ));

        const sortedData=sortData(data);
        setMapCountries(data);
        setTableData(sortedData);
        setCountries(countries);
      })
    }
    getCountriesData();
  },[]);

  const onCountryChange = async (event) =>{
    const countryCode=event.target.value;
    setCountry(countryCode);

    const url = countryCode === 'worldwide' ?
    "https://disease.sh/v3/covid-19/all" :
    `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then((response) => response.json())
    .then((data) =>{
      setCountry(countryCode);
      setCountryInfo(data);
      if(countryCode==='worldwide'){
        setMapCenter([34.80746,-40.4796])
        setMapZoom(3)
      } else{
        setMapCenter([data.countryInfo.lat,data.countryInfo.long]);
        setMapZoom(5);
      }



    });

  };


  return (
    <div className="app">
      <div className="app_left">
        <div className="app_header">
          {/*Header*/}
        <h1>Covid 19 </h1>
            {/*Title + select input dropdown field*/}
        <FormControl className="app_dropdown">
          <Select variant="outlined" value={country} onChange={onCountryChange}>
            <MenuItem value="worldwide">WorldWide</MenuItem>
            {
              countries.map((country) =>(
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))
            }

          </Select>
        </FormControl>

        </div>

          {/*Infobox*/}
          <div className="app_stats">
            <InfoBox
             active={casesType === "cases"}
             onClick={e => setCasesType('cases')} title="Coronavirus Cases" cases={prettyPrint(countryInfo.todayCases)} total={numeral(countryInfo.cases).format("0,0")}  />
            <InfoBox
             active={casesType==="recovered"}
             onClick={e => setCasesType('recovered')} title="Recovered" cases={prettyPrint(countryInfo.todayRecovered)} total={numeral(countryInfo.recovered).format("0,0")} />
            <InfoBox
             active={casesType==="deaths"}
             onClick={e => setCasesType('deaths')} title="Deaths" cases={prettyPrint(countryInfo.todayDeaths)} total={numeral(countryInfo.deaths).format("0,0")} />
          </div>
          {/*Infobox*/}
          {/*Infobox*/}

          <Map casesType={casesType} center={mapCenter} zoom={mapZoom} countries={mapCountries}/>

        {/*Map*/}
      </div>

      <Card className="app_right">
        <CardContent>
          <h3>Live cases by country</h3>
          {/*table*/}
          <Table countries={tableData} />
          <h3>WorldWide new {casesType} </h3>
          <LineGraph casesType={casesType} />
        </CardContent>

        {/*grapgh*/}
      </Card>

    </div>
  );
}

export default App;
