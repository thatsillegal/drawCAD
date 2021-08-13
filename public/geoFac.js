import * as THREE from '/build/three.module.js';

class Building{
    constructor(dots,floor){
        let points =[]
        for( var j=0; j< dots.length;j++){
            var point = new THREE.Vector2(dots[j][0],dots[j][1])
            points.push(point);
        }
        let shape = new THREE.Shape(points);
        let extrudeSettings = { depth: 3*floor, bevelEnabled: false,  steps: 1 };
        let geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
        let mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() )
        let edges = new THREE.EdgesGeometry(geometry) //EdgesGeo专门解决显示外轮廓的问题
        let line = new THREE.LineSegments(edges,new THREE.LineBasicMaterial({ //但要注意的是，这个地方要用LinesSegments对象
            color:0x0000ff
        }))

        this.mesh = mesh
        this.mesh.floor  =floor //FUCK！ ITS　just this ＥＡＳＹ！！！直接插入一个属性就好了！ ＦＵＣＫ！！！
        this.line = line
        this.floor = floor
        this.dots = dots
    }

    getFloor(){
        return this.floor
    }
}

export {Building}