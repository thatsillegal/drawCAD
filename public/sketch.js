import * as THREE from '/build/three.module.js';
import {OrbitControls} from '/jsm/controls/OrbitControls.js'
import * as dat from '/jsm/libs/dat.gui.module.js';
import {Building} from './geoFac.js'

//画布的样式，通过vue修改
// const canvasApp ={
//     data(){
//         return{
//             styleObject:{
//                 color: 'white',
//                 height: '1000px',
//                 width: '500px' 
//             }
//         }
//     }
// }
// Vue.createApp(canvasApp).mount("#canvas")


//创建scene
const scene = new THREE.Scene();

//Helpers
const axishelper = new THREE.AxisHelper(250)
scene.add(axishelper)

//创建Camera
const camera = new THREE.PerspectiveCamera(45,1,1,2000);
camera.position.set(0,0,1000);
camera.lookAt(2000,2000,0);
scene.add(camera)

//创建Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(500,500)

//贴附renderer
const canvas = document.querySelector('div.webgl');
canvas.appendChild(renderer.domElement)

//创建OrbitControl
const controls = new OrbitControls(camera, renderer.domElement);

//创建light
const ambientlight = new THREE.AmbientLight(0x404040);
scene.add(ambientlight)
const sunlight = new THREE.DirectionalLight(0x909090);
sunlight.position.set(1,-1,1.5)
scene.add(sunlight)


//创建Line Geometry
let points=[]; //我去 千万不要用const 那是常量，不能修改
let geometry = new THREE.BufferGeometry();
let material = new THREE.LineBasicMaterial({color:0x0000ff});
let line = new THREE.Line(geometry,material);
let group = new THREE.Group();
let plane = new THREE.Mesh();
scene.add(line);
scene.add(group);


//创建raytrace
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
function onMousemove(event){
    event.preventDefault();
    // /在webGL中，世界坐标系是以屏幕中心为原点(0, 0, 0)，且是始终不变的。你面对屏幕，你的右边是x正轴，上面是y正轴，屏幕指向你的为z正轴。长度单位这样来定：窗口范围按此单位恰好是(-1,-1,-1)到(1,1,1)。
    //下面的步骤应该是把屏幕坐标转化为世界坐标，屏幕坐标X右Y下为正，webgl世界坐标X右Y上为正，所以有个反向，并且domain限制在[-1，1]
    // mouse.x = ( event.clientX / 500 ) * 2 - 1;
    // mouse.y = - ( event.clientY / 500 ) * 2 + 1;
    //如果不是全屏，就用getBoundingClientRect的方法获取所处元素的坐标
    let mousepos = getMousePos(canvas,event);
    mouse.x = mousepos.x*2-1;
    mouse.y = -mousepos.y*2+1
}
function getMousePos(canvas,e){
    let rect = canvas.getBoundingClientRect();
    return{
        x:(e.clientX - rect.left)/rect.width,
        y:(e.clientY - rect.top)/rect.height
    }
}
canvas.addEventListener( 'mousemove', onMousemove, false );
//创建一个临时INTERSECT对象
let INTERSECTED
//添加选取功能
function render(){
    renderer.render(scene, camera)
    raycaster.setFromCamera( mouse, camera );
    let intersects = raycaster.intersectObjects( scene.children, true ); //后一个true是 recursive的意思 意味着是否能检测到group中的物体
    if(intersects.length > 0 ){
        if(INTERSECTED != intersects[0].object){
            //有的话就设置为发光
            if(INTERSECTED){
                INTERSECTED.material.color.set( INTERSECTED.currentHex ); //设回之前的颜色
            }
            //不管有没有
            INTERSECTED = intersects[0].object
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex() //给INTERSECTED设置一个属性 ，并且把当前颜色的hex值付给他，这个功能非常好用，可以直接保存要临时保存的值
            INTERSECTED.material.color.set( 0xff0000 );
        } 
    }else{
        if(INTERSECTED) INTERSECTED.material.color.set( INTERSECTED.currentHex ); //这个颜色应该是之前的颜色
        INTERSECTED = null;
    }
}

//弹出选取信息
canvas.addEventListener('click',popInfo);
function popInfo(){
    if(INTERSECTED){
        if(INTERSECTED.floor){
            console.log("Floor: "+INTERSECTED.floor)
        }else{
            console.log('No floor info detected.')
        }
       
    }else{
        // console.log('No house selected.')
    }
}


//更新窗口动画
const animate = () =>
{
    controls.update();
    render();
    window.requestAnimationFrame(animate)
}
animate()


//读取JSON数据
$(document).ready(function(){
	$("#refresh").click(function(){
		$.get("/refresh",redraw);
	});
    $("#refresh2").click(function(){
        $.get("/refresh2",redraw2);
    });
});

function redraw(data){
    scene.remove(line) //这个函数非常重要，不然他不知道没有删除之前的对象
    scene.remove(group)
    scene.remove(plane)

    points=[] //清空数组
    let list = data.values
    let n = list.length/3;
    for(let i=0;i<n;i++){
        let x= list[i*3]
        let y= list[i*3+1]
        let z= list[i*3+2]
        points.push(new THREE.Vector3(x,y,z))
    }
    points.push(points[0])//把第一个变量放到最后
    // console.log(points)
    geometry = new THREE.BufferGeometry().setFromPoints(points);
    line = new THREE.Line(geometry,material);
    scene.add(line)

    // renderer.render(scene,camera);
}

function redraw2(data){
    scene.remove(group) //这个函数非常重要，不然他不知道没有删除之前的对象
    scene.remove(line);
    scene.remove(plane)


    //创建地平面
    let geometry = new THREE.PlaneGeometry(1000,1000)
    // geometry.position.set(0,0,0)
    // console.log(geometry.position)
    plane = new THREE.Mesh(geometry,new THREE.MeshLambertMaterial())
    scene.add(plane)


    // let polygon=[]
    // let buildings = JSON.parse(data);
    // console.log(data.length);
    let len = data.length

    group = new THREE.Group();

    for(var i=0; i<len;i++){

        let dots = data[i].dots;
        let floor = data[i].floor;
        if(floor == 0) floor =1;

        let building = new Building(dots,floor)
        group.add(building.mesh)
        group.add(building.line)
    }

    scene.add(group)
    // console.log(scene.children)
}