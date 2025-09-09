const socket = io();

console.log("Hello Jee")

if(navigator.geolocation){
    // console.log("Supported the geolocation");
    navigator.geolocation.watchPosition((position)=>{
        const {latitude,longitude} = position.coords;
        socket.emit("send-location",{latitude,longitude});
    },(error)=>{
        console.error(error);
    },{
        enableHighAccuracy:true,
        timeout:5000,
        maximumAge:0,
    })
}

const map = L.map("map").setView([0,0],15);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:"Kartik Chouhan"
}).addTo(map)


const markers = {};

socket.on("receive-location",(data)=>{
    const {id,latitude,longitude} = data;
    map.setView([latitude,longitude]);
    if(markers[id]){
        markers[id].setLatLng([latitude,longitude]);
    }
    else{
        markers[id] = L.marker([latitude,longitude]).addTo(map);
    }
})

socket.on("user-disconnectedt",(id)=>{
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete marker[id];
    }
})