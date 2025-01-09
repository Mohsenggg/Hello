
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
console.log("supabaseUrl >>>> ");
const supabaseUrl = "https://zsiyjcxtslhyjoduoick.supabase.co";
console.log("supabaseKey >>>> ");
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXlqY3h0c2xoeWpvZHVvaWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNTM5MjAsImV4cCI6MjA1MTkyOTkyMH0.Wl7WYN6LiciLkVhCBn-bwZA9Tcx2cx6TUCnn8PttQ7s";
const supabase = createClient(supabaseUrl, supabaseKey);
console.log(supabase);

// Canvas setup
const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase after the DOM is fully loaded

    // Set up Event Listeners after Supabase is initialized
    document.getElementById('addNodeBtn').addEventListener('click', addNode);
    document.getElementById('updateNodeBtn').addEventListener('click', updateNode);
    document.getElementById('deleteNodeBtn').addEventListener('click', deleteNode);
    document.getElementById('resetTreeBtn').addEventListener('click', resetTree);
    document.getElementById('saveTreeBtn').addEventListener('click', () => saveTree(nodes));
    document.getElementById('loadTreeBtn').addEventListener('click', () => {
        const treeId = document.getElementById('treeIdInput').value;
        loadTree(treeId);
    });

    // Initialize tree rendering and controls
    drawTree();
    updateParentNodeSelect();
});

// Global variables
let selectedNode = null;
let draggingNode = null;
const rootNode = { x: canvas.width / 2, y: 50, value: "Root", children: [] };
let nodes = [rootNode];
const levelHeight = 80;
const horizontalSpacing = 100;

// Drawing Functions
function drawTree() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNode(rootNode);
}

function drawNode(node) {
    if (!node) return;
    const { x, y, value, children } = node;

    // Draw node
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = selectedNode === node ? '#ff6961' : '#69a1f4';
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    // Draw text
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value, x, y);

    // Draw children
    children.forEach(child => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(child.x, child.y);
        ctx.stroke();
        drawNode(child);
    });
}

// Node Manipulation Functions
function addNode() {
    const value = document.getElementById('nodeValue').value;
    const parentIndex = document.getElementById('parentNodeSelect').value;
    const position = document.getElementById('childPositionSelect').value;

    if (!value) return alert('Enter a value for the node.');

    const parentNode = nodes[parentIndex] || rootNode;
    const newNode = { x: 0, y: 0, value, children: [] };

    newNode.x = position === 'left'
        ? parentNode.x - horizontalSpacing / (parentNode.y / levelHeight + 1)
        : position === 'right'
        ? parentNode.x + horizontalSpacing / (parentNode.y / levelHeight + 1)
        : parentNode.x + (parentNode.children.length - 1) * 60;

    newNode.y = parentNode.y + levelHeight;
    parentNode.children.push(newNode);
    nodes.push(newNode);

    drawTree();
    updateParentNodeSelect();
    document.getElementById('nodeValue').value = '';
}

function updateNode() {
    const value = document.getElementById('nodeValue').value;
    if (!selectedNode) return alert('Select a node to update.');
    selectedNode.value = value;
    drawTree();
    updateParentNodeSelect();
}


// Add deleteNode

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

// Backend Functions
async function saveTree(treeData) {
    if (!supabase) {
        alert('Supabase is not initialized.');
        return;
    }

    try {
        const { data, error } = await supabase.from('trees').insert([{ data: JSON.stringify(treeData) }]);
        if (error) throw error;
        alert('Tree saved successfully!');
    } catch (err) {
        console.error(err);
        alert('Error saving tree.');
    }
}

async function loadTree(treeId) {
    if (!supabase) {
        alert('Supabase is not initialized.');
        return;
    }

    try {
        const { data, error } = await supabase.from('trees').select('data').eq('id', treeId);
        if (error) throw error;
        if (data.length > 0) {
            nodes = [JSON.parse(data[0].data)];
            drawTree();
            alert('Tree loaded successfully!');
        } else {
            alert('No tree found with the given ID.');
        }
    } catch (err) {
        console.error(err);
        alert('Error loading tree.');
    }
}

// Initialize
function resetTree() {
    nodes = [rootNode];
    rootNode.children = [];
    selectedNode = null;
    drawTree();
    updateParentNodeSelect();
}
