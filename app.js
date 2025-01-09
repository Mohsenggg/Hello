
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
console.log("supabaseUrl >>>> ");
const supabaseUrl = "https://zsiyjcxtslhyjoduoick.supabase.co";
console.log("supabaseKey >>>> ");
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXlqY3h0c2xoeWpvZHVvaWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNTM5MjAsImV4cCI6MjA1MTkyOTkyMH0.Wl7WYN6LiciLkVhCBn-bwZA9Tcx2cx6TUCnn8PttQ7s";
const supabase = createClient(supabaseUrl, supabaseKey);
console.log(supabase);

const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');

let selectedNode = null;
let draggingNode = null;
const rootNode = { x: canvas.width / 2, y: 50, value: "Root", children: [] };
let nodes = [rootNode];
const levelHeight = 80;
const horizontalSpacing = 100;

canvas.addEventListener('mousedown', startDragging);
canvas.addEventListener('mousemove', dragNode);
canvas.addEventListener('mouseup', stopDragging);


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%   Draw Functions  %%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// 1 ================================================================
function drawTree() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNode(nodes[0]);
    // drawNode(rootNode);


}
// 2 ================================================================
function drawNode(node) {
    if (!node) return;
    // define what is node and its charachteristics
    console.log('Drawing node:', node);  // Log each node being drawn

    const { x, y, value, children } = node;

    // Draw the node itself
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = selectedNode === node ? '#ff6961' : '#69a1f4';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();
    ctx.closePath();

    // Draw the node's value
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value, x, y);

    // Draw lines to the child nodes
    if (children && children.length > 0) {
        console.log(`Drawing ${children.length} children of node: ${value}`);
        children.forEach(child => {
            ctx.beginPath();
            ctx.moveTo(x, y);  // Start at the parent node
            ctx.lineTo(child.x, child.y);  // Draw a line to the child node
            ctx.stroke();
            drawNode(child);  // Recursively draw the child node and its children
        });
}
}
// 3 ================================================================
function updateParentNodeSelect() {
    const select = document.getElementById('parentNodeSelect');
    select.innerHTML = ''; // Clear the existing options

    nodes.forEach((node, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${node.value} (Node ${index})`;
        select.appendChild(option);
    });
}
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%  Controle Functions   %%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%% ADD %% UPDATE %% DELETE %%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// 4 ================================================================
function addNode() {
    const value = document.getElementById('nodeValue').value;
    const parentIndex = document.getElementById('parentNodeSelect').value;
    const position = document.getElementById('childPositionSelect').value;

    if (!value) {
        alert('Please enter a value for the node.');
        return;
    }

    const parentNode = selectedNode || nodes[parentIndex];
    const newNode = { x: 0, y: 0, value, children: [] };

    if (position === 'left') {
        newNode.x = parentNode.x - horizontalSpacing / (parentNode.y / levelHeight + 1);
    } else if (position === 'right') {
        newNode.x = parentNode.x + horizontalSpacing / (parentNode.y / levelHeight + 1);
    } else {
        newNode.x = parentNode.x + (parentNode.children.length - 1) * 60;
    }

    newNode.y = parentNode.y + levelHeight;
    parentNode.children.push(newNode);
    nodes.push(newNode);

    drawTree();
    updateParentNodeSelect();
    document.getElementById('nodeValue').value = ''; // Clear the input field
}
// 5 ================================================================
function updateNode() {
    const value = document.getElementById('nodeValue').value;

    if (!selectedNode) {
        alert('Please select a node to update.');
        return;
    }

    if (!value) {
        alert('Please enter a new value for the node.');
        return;
    }

    selectedNode.value = value;
    drawTree();
    updateParentNodeSelect();
    document.getElementById('nodeValue').value = ''; // Clear the input field
}
// 6 ================================================================
function deleteNode() {
    if (!selectedNode) {
        alert('Please select a node to delete.');
        return;
    }

    if (selectedNode === rootNode) {
        resetTree();
        return;
    }

    const deleteFromParent = (parentNode, targetNode) => {
        parentNode.children = parentNode.children.filter(child => child !== targetNode);
        targetNode.children.forEach(child => deleteFromParent(targetNode, child)); // Recursively delete children
    };

    nodes = nodes.filter(node => node !== selectedNode);
    nodes.forEach(parentNode => {
        deleteFromParent(parentNode, selectedNode);
    });

    selectedNode = null;
    drawTree();
    updateParentNodeSelect();
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%  Movement Functions   %%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%% SELECT %% START %% MOVE %% DROP %%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// 7 ================================================================
function selectNodeByClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    selectedNode = null;
    nodes.forEach(node => {
        const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
        if (distance < 20) {
            selectedNode = node;
        }
    });

    drawTree();
    if (selectedNode) {
        const index = nodes.indexOf(selectedNode);
        document.getElementById('parentNodeSelect').value = index;
    }
}
// 8 ================================================================
function startDragging(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    draggingNode = null;
    nodes.forEach(node => {
        const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
        if (distance < 20) {
            draggingNode = node;
        }
    });

    if (draggingNode) {
        selectedNode = draggingNode;
        const index = nodes.indexOf(selectedNode);
        document.getElementById('parentNodeSelect').value = index;
    }
}
// 9 ================================================================
function dragNode(event) {
    if (!draggingNode) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    draggingNode.x = x;
    draggingNode.y = y;

    drawTree();
}
// 10 ================================================================
function stopDragging() {
    draggingNode = null;
}
// 11 ================================================================


// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%  Functional Functions %%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%% RESET %% LOAD %% SAVE %%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// 12 ================================================================
function resetTree() {
    nodes = [rootNode];
    rootNode.children = [];
    selectedNode = null;
    drawTree();
    updateParentNodeSelect();
}


// Save Tree Data
async function saveTree() {

     const treeData = JSON.stringify(nodes);
    // Validate treeData
    console.log('Tree data to save:', treeData);

    if (!treeData || treeData.length === 0) {
        console.error('Error: Tree data is empty or undefined.');
        alert('Cannot save an empty tree.');
        return;
    }

    // Insert data into Supabase
    const { data, error } = await supabase
        .from('trees')
        .insert([{ data: JSON.stringify(treeData) }]);

    if (error) {
        console.error('Error saving tree:', error);
        alert('Error saving tree. Please check the console for details.');
    } else {
        console.log('Tree saved successfully:', data);
        alert('Tree saved successfully!');
    }
}

// Load Tree Data
async function loadTree(treeId) {
    const { data, error } = await supabase
        .from('trees')
        .select('data')
        .eq('id', treeId);

    if (error) {
        console.error('Error loading tree:', error);
        alert('Error loading tree. Please check the console for details.');
        return;
    }

  if (data && data.length > 0) {
        // Supabase already returns the `data` field as JSON
        const treeData = data[0].data;

        console.log('Tree data retrieved from database:', treeData);

        // Use the root node (treeData[0]) to initialize nodes
        nodes = [treeData[0]];
        console.log('nodes array after loading:', nodes);

        // Redraw the tree
        drawTree();
        console.log('Tree loaded successfully');
    } else {
        alert('Tree not found with the given ID.');
    }
}



// Attach functions to the global window object
window.addNode = addNode;
window.updateNode = updateNode;
window.deleteNode = deleteNode;
window.saveTree = saveTree;
window.loadTree = loadTree;
window.resetTree = resetTree;

// Initialize the tree and controls
drawTree();
updateParentNodeSelect();

