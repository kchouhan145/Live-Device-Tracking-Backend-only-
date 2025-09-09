const socket = io();

console.log("Hello Jee")

// Generate a persistent device ID
function getDeviceId() {
    let id = localStorage.getItem("deviceId");
    if (!id) {
        id = "device-" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("deviceId", id);
    }
    return id;
}
const deviceId = getDeviceId();

let lastPosition = { latitude: null, longitude: null };
const positionThreshold = 0.0001; // Minimum change to send update

if(navigator.geolocation){
    navigator.geolocation.watchPosition((position)=>{
        const {latitude,longitude} = position.coords;
        // Throttle updates: only emit if position changes significantly
        if (
            Math.abs(latitude - (lastPosition.latitude || 0)) > positionThreshold ||
            Math.abs(longitude - (lastPosition.longitude || 0)) > positionThreshold
        ) {
            lastPosition = { latitude, longitude };
            socket.emit("send-location", { deviceId, latitude, longitude });
        }
    },(error)=>{
        console.error(error);
    },{
        enableHighAccuracy:true,
        timeout:2000,
        maximumAge:0,
    })
}

const map = L.map("map").setView([0,0],15);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:"Kartik Chouhan"
}).addTo(map)

const markers = {};

socket.on("receive-location",(data)=>{
    const {deviceId,latitude,longitude} = data;
    if(markers[deviceId]){
        markers[deviceId].setLatLng([latitude,longitude]);
    }
    else{
        markers[deviceId] = L.marker([latitude,longitude]).addTo(map);
    }
    // Only set map view for this device
    if (deviceId === deviceId) {
        map.setView([latitude,longitude]);
    }
})

socket.on("user-disconnected",(deviceId)=>{
    if(markers[deviceId]){
        map.removeLayer(markers[deviceId]);
        delete markers[deviceId];
    }
})