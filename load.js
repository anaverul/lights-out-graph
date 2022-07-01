const canvas = document.getElementById("myCanvas");
const context = canvas.getContext('2d');

var nodes = [];
var edges = [];

const colors = ['#FFFFFF', "#ffc800",'#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#46f0f0',
                   '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#ffe119', '#9a6324', '#fffac8',
                   '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'];
const EDGE = '#009999';
const  SELECTED = '#88aaaa';
//const LIGHTBLUE =  '#22cccc';
const btn_mode = document.getElementById('play_button');
const btn_clear = document.getElementById('clear');


btn_mode.addEventListener('click', function handleClick() {
  if (btn_mode.textContent === 'Editing'){
    for (i = 0; i < nodes.length; i++)
      nodes[i].value = 0;
    btn_mode.textContent = 'Playing';
    btn_clear.textContent = 'Reset Puzzle';
  }
  else{
    btn_mode.textContent = 'Editing';
    btn_clear.textContent = 'Clear Puzzle';
  }
});

function  getMousePos(evt) {
  var rect = canvas.getBoundingClientRect(),
    scaleX = canvas.width / rect.width,
    scaleY = canvas.height / rect.height;
  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY
  }
}
function drawNode(node) {
    context.beginPath();
    context.fillStyle = node.fillStyle;
    context.arc(node.x, node.y, node.radius, 0, Math.PI * 2, true);
    context.strokeStyle = node.strokeStyle;
    context.stroke();
    context.fill();
}
var selection = undefined;
function within(x, y) {
    return nodes.find(n => {
        return (x-n.x)**2+(y-n.y)**2 <= n.radius**2;
    });
}
window.onmousemove = move;
window.onmousedown = down;
window.onmouseup = up;
window.onkeyup = key_up;
function create_node(x_0, y_0, color){
  let node = {
      x: x_0,
      y: y_0,
      radius: 10,
      selected: false,
      value : 0,
      clicks : 0
  };
  nodes.push(node);
  draw();
  return node;
}
function create_edge(fromNode, toNode, round){
  if(round){
    context.beginPath();
    context.strokeStyle = fromNode.strokeStyle;
    var a = fromNode.x;
    var b = fromNode.y;
    var c = toNode.x;
    var d = toNode.y;
    var dist = Math.sqrt((d-b)**2+(a-c)**2);
    context.moveTo(a, b);
    context.quadraticCurveTo((a+c)/2+40*(d-b)/dist, (b+d)/2+40*(a-c)/dist, c, d);
    context.stroke();
  }
  else{
    context.beginPath();
    context.strokeStyle = fromNode.strokeStyle;
    context.moveTo(fromNode.x, fromNode.y);
    context.lineTo(toNode.x, toNode.y);
    context.stroke();
  }
}
function draw() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (let i = 0; i < edges.length; i++)
      create_edge(edges[i].from, edges[i].to, edges[i].round);
  if (btn_mode.textContent == 'Editing'){
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            context.beginPath();
            context.fillStyle = node.selected ? SELECTED : WHITE;
            context.arc(node.x, node.y, node.radius, 0, Math.PI * 2, true);
            context.strokeStyle = node.strokeStyle;
            context.fill();
            context.stroke();
        }
    }
  else{
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            context.beginPath();
            context.fillStyle = colors[node.value];
            context.arc(node.x, node.y, node.radius, 0, Math.PI * 2, true);
            context.strokeStyle = node.strokeStyle;
            context.fill();
            context.stroke();
        }
    }
}
function move(e) {
    if (btn_mode.textContent == 'Editing'){
      if (selection && e.buttons){
        var pos =  getMousePos(e);
        if (pos.x>0 && pos.x<=canvas.width && pos.y>0 && pos.y<=canvas.height){
          selection.x = e.offsetX;
          selection.y = e.offsetY;
          selection.moving = true;
          draw();
        }
      }
    }
}
function find_edge(fromNode, toNode){
      return edges.find(e => {
          return (e.from == fromNode && e.to == toNode) || (e.from == toNode && e.to == fromNode);
        });
}
function down(e) {
    if (btn_mode.textContent == 'Editing'){
      let target = within(e.offsetX, e.offsetY);
      if (selection && selection.selected) {
          selection.selected = false;
      }
      if (target) {
          if (selection && selection !== target) {
            var edge = find_edge(target, selection);
              if (!edge)
                edges.push({ from: selection, to: target, round: false });
              else {
                  for (let j = 0; j < edges.length; j++){
                    if (edges[j] == edge ){
                      edges.splice(j,1);
                      j = j-1;
                    }
                  }
              }
          }
          selection = target;
          selection.selected = true;
          draw();
      }
    }
}
function up(e) {
   var num_colors = parseInt(document.getElementById('num_colors_input').value);
    var pos =  getMousePos(e);
    if (btn_mode.textContent == 'Editing'){
      if (!selection){
        if (pos.x>0 && pos.x<=canvas.width && pos.y>0 && pos.y<=canvas.height)
          create_node(e.offsetX , e.offsetY );
      }
      if (selection && !selection.selected) {
          selection = undefined;
          draw();
      }
    }
    else{
      let target = within(e.offsetX, e.offsetY);
      if (target){
        target.value = (target.value +1)%num_colors;
        target.clicks = (target.clicks + 1)%num_colors;
        for(let i = 0; i < edges.length;i++){
          var other = undefined;
          if (edges[i].from == target)
            other = edges[i].to;
          else if (edges[i].to == target)
            other = edges[i].from;
          if (other)
            other.value = (other.value + 1)%num_colors;
        }
        draw();
      }

    }
}
function key_up(e){
  if (btn_mode.textContent == 'Editing'){
    if (e.code == 'Backspace' || e.code == 'Delete'){
      if(selection && selection.selected){
        for (let j = 0; j < edges.length; j++){
          if (edges[j].from == selection || edges[j].to == selection){
            edges.splice(j,1);
            j = j-1;
          }
        }
        for (let i = 0; i < nodes.length; i++){
          if (nodes[i]==selection){

            nodes.splice(i,1);
            break;
          }
        }
        selection = undefined;
        draw();
      }
    }
  }
}
function clear_puzzle(){
  if (btn_mode.textContent == 'Editing'){
    nodes = [];
    edges = [];
  }
  else {
    for (i = 0; i < nodes.length; i++)
      nodes[i].value = 0;
  }
  draw();
}
function generate_puzzle(){
  nodes = [];
  edges = [];
  var all_nodes = [];
  var variation = document.getElementById("choose_variation").value;
  var num_rows = parseInt(document.getElementById("row_input").value);
  var num_cols = parseInt(document.getElementById("col_input").value);
  if (variation == "standard"){
    for (let y = 50; y <= num_rows*50; y += 50){
      var nodeRow = [];
      for (let x = 50; x <= num_cols*50; x += 50){
        nodeRow.push(create_node(x,y));
      }
      all_nodes.push(nodeRow);
    }
    // horizontal edges
    for (let i = 0; i<=num_rows-1; i++){
      for (let k = 0; k<num_cols-1; k++){
        edges.push({from: all_nodes[i][k], to: all_nodes[i][k+1], round: false});
      }
    }
    // vertical edges
    for (let i = 0; i<num_rows-1; i++){
      for (let k = 0; k<=num_cols-1; k++){
        edges.push({from: all_nodes[i][k], to: all_nodes[i+1][k], round: false});
      }
    }
    if (document.getElementById("top_bottom").checked){

      // connecting top and bottom edges
      for (let i = 0; i<=num_cols-1; i++){
        edges.push({from: all_nodes[0][i], to: all_nodes[num_rows-1][i], round: true});
      }
    }
    if (document.getElementById("sides").checked){
      // connecting left and right edges
      for (let i = 0; i<=num_rows-1; i++){
        edges.push({from: all_nodes[i][0], to: all_nodes[i][num_cols-1], round: true});
      }
    }
  }
  else if (variation == "diagonal"){
    for (let y = 50; y <= num_rows*50; y += 50){
      var nodeRow = [];
      for (let x = 50; x <= num_cols*50; x += 50){
        nodeRow.push(create_node(x,y));
      }
      all_nodes.push(nodeRow);
    }
    // horizontal edges
    for (let i = 0; i<=num_rows-2; i++){
      for (let k = 0; k<num_cols-1; k++){
        edges.push({from: all_nodes[i][k], to: all_nodes[i+1][k+1], round: false});
      }
    }
    // vertical edges
    for (let i = 0; i<num_rows-1; i++){
      for (let k = 0; k<=num_cols-2; k++){
        edges.push({from: all_nodes[i+1][k], to: all_nodes[i][k+1], round: false});
      }
    }
  }
  draw();
}