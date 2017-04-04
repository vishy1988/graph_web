$('input[type=submit]').click(function() {
				var input_ID= $("#input_ID").val();
				var Node_Type= $("#Node_Type").val();
				$('#select_ID').val('5');
				document.getElementById('Start_Date').value = "";
				document.getElementById('End_Date').value = "";
				document.getElementById('node').value = "";




				$.ajax({
								type: "POST",
								url: "/",
								dataType: "json",

								data:{input_ID: input_ID,
												Node_Type: Node_Type,

								},
								success: function(data) {
												if (data=='Wrong ID and Node_type'){
																alert(data);
												}
												else{
																var IDData = JSON.stringify(data);
																console.log(IDData);
																var galData = JSON.parse(IDData);

																var startnodes = [];
																var endnodes = [];
																var startnodetype = [];
																var endnodetype = [];
																var SendTime = [];
																var PayTime = [];
																var Total_Amt = [];
																var Depth = [];
																galData.map(function(e, i) {
																				startnodes.push(e[0]);
																				endnodes.push(e[1]);
																				startnodetype.push(e[2]);
																				endnodetype.push(e[3]);
																				SendTime.push(e[4]);
																				PayTime.push(e[5]);
																				Total_Amt.push(e[6]);
																				Depth.push(e[7]);
																});}

																window.final_data = createNodes(startnodes, endnodes, startnodetype, endnodetype, SendTime,PayTime, Total_Amt, Depth);
																makeGraph("#Network_graph", final_data);

								}
				});
				return false;
});

var searchBtn = document.getElementById("search");
var parseDate = d3.timeFormat('%Y-%m-%d %H:%M:%S');
console.log(parseDate(new Date('2015-1-7 13:45:54')));
var filtered = [];
function createNodes(startnodes, endnodes, startnodetype, endnodetype, SendTime, PayTime, Total_Amt, Depth) {
				var node_set = [];
				var links = [];
				var nodetype = d3.set();
				startnodes.forEach(function(src, i) {
								var tgt = endnodes[i];
								if (!node_set.find(function(d) {
												return d.id == src
								})) {
												node_set.push({
																id: src,
																type: startnodetype[i]
												});
								}
								if (!node_set.find(function(d) {
												return d.id == tgt
								})) {
												node_set.push({
																id: tgt,
																type: endnodetype[i]
												});
								}

								links.push({
												source: src,
												target: tgt,
												sendtime: SendTime[i],
												paytime: PayTime[i],
												total_amt: Total_Amt[i],
												depth: Depth[i],
												value: 1
								});
				});

				startnodetype.forEach(function(src, i) {
								var tgt_type = endnodetype[i];
								nodetype.add(src);
								nodetype.add(tgt_type);
				});

				var d3GraphData = {
								nodes: node_set.map(function(d) {
												return {
																id: d.id,
																type: d.type,
																group: 1,
																visible: true
												}
								}),
								links: links,
								nodetype: nodetype.values().map(function(d) {
												return {
																id: d.id,
																group: 1
												}
								})
				}
				return d3GraphData;

};

function getOpacity(node) {
				return node.visible ? 1 : 0;
}

function makeGraph(selector, d3GraphData) {
				console.log(d3GraphData)

								var width = 1160,
								height = 700,
								radius = 6;
				d3.selectAll("svg > *").remove();
				var svg = d3.select(selector).append("svg")
								.attr("width", width)
								.attr("height", height);

				svg.append("svg:defs").selectAll("marker")
								.data(["end"])      // Different link/path types can be defined here
								.enter().append("svg:marker")    // This section adds in the arrows
								.attr("id", String)
								.attr("viewBox", "0 -5 10 10")
								.attr("refX", 15)
								.attr("refY", -1.5)
								.attr("markerWidth", 4)
								.attr("markerHeight", 4)
								.attr("orient", "auto")
								.append("svg:path")
								.attr("d", "M0,-5L10,0L0,5");

				var color = d3.scaleOrdinal(d3.schemeCategory10);

				var simulation = d3.forceSimulation()
								.force("link", d3.forceLink().id(function(d) {
												return d.id;
								}).distance(60).strength(1))
				.force("charge", d3.forceManyBody())
								.force("center", d3.forceCenter(width / 2, height / 2))
								.force("gravity", gravity(0.25));

				function gravity(alpha) {
								return function(d) {
												d.y += (d.cy - d.y) * alpha;
												d.x += (d.cx - d.x) * alpha;
								};
				}
				var link = svg.append("g")
								.attr("class", "links")
								.selectAll("line")
								.data(d3GraphData.links)
								.enter().append("line")
								.attr("stroke-width", 3)
								.attr("class", "link")
								.attr("marker-end", "url(#end)")
								.on('mouseover', function(d) {

												var thisSource = d.source.id,
												thisTarget = d.target.id;
												var filteredLinks = d3GraphData.links.filter(function(e) {
																return (e.source.id === thisSource && e.target.id === thisTarget) || (e.source.id === thisTarget && e.target.id === thisSource);
												});



												tooltip.html("");

												var list = tooltip.selectAll(".list")
																.data(filteredLinks)
																.enter()
																.append("div");

												list.html(function(d) {

																return "Paytime: " + d.paytime + "<br>Sendtime: " + d.sendtime + "<br>Amount: " + d.total_amt + "<br>Depth: " + d.depth + "<br><br>";
												});


												tooltip.transition()
																.duration(600)
																.style("opacity", .8);
												tooltip.style("left", (d3.event.pageX) + "px")
																.style("top", (d3.event.pageY + 10) + "px");
								})
				.on("mouseout", function() {
								tooltip.transition()
												.duration(300)
												.style("opacity", 0);
				})
				.on("mousemove", function() {
								tooltip.style("left", (d3.event.pageX) + "px")
												.style("top", (d3.event.pageY + 10) + "px");
				});

				var node = svg.append("g")
								.attr("class", "nodes")
								.selectAll("circle")
								.data(d3GraphData.nodes)
								.enter().append("circle")
								.attr("class", "node")
								.attr("r", 8)
								.attr("fill", function(d) {
												return color(d.type);
								})
				.style("opacity", function(d) {
								return getOpacity(d)
				})
				.on('mouseover', function(d) {
								tooltip.transition()
												.duration(600)
												.style("opacity", .8);
								tooltip.html(d.id + "<p/>type:" + d.type)
												.style("left", (d3.event.pageX) + "px")
												.style("top", (d3.event.pageY + 10) + "px");
				})
				.on("mouseout", function() {
								tooltip.transition()
												.duration(200)
												.style("opacity", 0);
				})
				.on("mousemove", function() {
								tooltip.style("left", (d3.event.pageX) + "px")
												.style("top", (d3.event.pageY + 10) + "px");
				})
				.call(d3.drag()
												.on("start", dragstarted)
												.on("drag", dragged)
												.on("end", dragended));


				simulation
								.nodes(d3GraphData.nodes)
								.on("tick", ticked);

				simulation.force("link")
								.links(d3GraphData.links);


				var ID = document.getElementById("input_ID").value;

				var origin = node.filter(function(d) {
								return d.id == ID;
				});
				origin.style("opacity", 1)
								.style("fill", "black")
								.attr("class", "node")
								.attr("r",20);


				var circles = svg.selectAll(".node");
				var lines = svg.selectAll(".link");

				lines.style("opacity", function(d) {
								return getOpacity(d.source) && getOpacity(d.target) ? 1 : 0;
				})
				var nodeTypes = ["Agent", "Customer", "Phone", "ID_Card"];
				var checkBoxes = [];
				for (let i = 0; i < nodeTypes.length; i++) {
								checkBoxes.push(document.querySelectorAll('input[value="' + nodeTypes[i] + '"]')[0])
												checkBoxes[i].checked = true;
								checkBoxes[i].addEventListener("click", function() {
												filterBy("type", checkBoxes[i].value, checkBoxes[i].checked);
								});
				}

				var toggleOpacity = function(attribute, value, visible) {
								circles.filter(function(d) { //filter circles by attribute value
												return d[attribute] == value;
								})
								.each(function(d) { //modify visible attribute
												d.visible = visible;
								})
								.style("opacity", function(d) { // get opacity
												return getOpacity(d);
								});
								lines.filter(function(d) { // get links for attribute-value
												return d.source[attribute] == value || d.target[attribute] == value;
								})
								.style("opacity", function(d) { // modify opacity
												return getOpacity(d.source) && getOpacity(d.target) ? 1 : 0;
								})
				}

				var filterBy = function(attribute, value, visible, highlightSelected) {

								if (highlightSelected) {
												circles.style("opacity", 0)
																lines.style("opacity", 0)

																toggleOpacity(attribute, value, visible)

																circles.filter(function(d){return d.visible;}).transition()
																.duration(5000)
																.style("opacity", 1);

												lines.filter(function(d){return d.source.visible && d.target.visible}).transition()
																.duration(5000)
																.style("opacity", 1);
								}
								else{
												toggleOpacity(attribute, value, visible)
								}

				}

				if(searchBtn) {		searchBtn.addEventListener("click", function() {




								document.getElementById('Start_Date').value = "";
								document.getElementById('End_Date').value = "";

								var selectedVal = document.getElementById('node').value;
								if (nodeTypes.indexOf(selectedVal) > -1) {
												filterBy("type", selectedVal, true, true);
								} else {
												filterBy("id", selectedVal, true, true);
								}
				});
				document.getElementById('node').value = "";
				}


				function ticked() {
								link
												.attr("x1", function(d) {
																return d.source.x;
												})
								.attr("y1", function(d) {
												return d.source.y;
								})
								.attr("x2", function(d) {
												return d.target.x;
								})
								.attr("y2", function(d) {
												return d.target.y;
								});

								node
												.attr("cx", function(d) {
																return d.x;
												})
								.attr("cy", function(d) {
												return d.y;
								});
				}


				function dragstarted(d) {
								if (!d3.event.active) simulation.alphaTarget(0.3).restart();
								d.fx = d.x;
								d.fy = d.y;
				}

				function dragged(d) {
								d.fx = d3.event.x;
								d.fy = d3.event.y;
				}

				function dragended(d) {
								if (!d3.event.active) simulation.alphaTarget(0);
								d.fx = null;
								d.fy = null;
				}

}


function isUnique(id, nodes) {
				for (var i = 0; i < nodes.length; i++) {
								if (nodes[i].id == id) {
												return false;
								}
				}
				return true;
}


var elem = document.getElementById('select_ID');
elem.addEventListener("change", onSelectChange);

function onSelectChange() {

				document.getElementById('Start_Date').value = "";
				document.getElementById('End_Date').value = "";
				document.getElementById('node').value = "";

				var value = this.value;
				var fdata = filteredData(value);
				d3.select('#Network_graph').selectAll("*").remove();
				makeGraph("#Network_graph", fdata);
}

function filteredData(value) {
				var filtered_data = {};
				var nodes = [];
				var links = [];

				d3.selectAll("line").filter(function(d, i) {
								if (d.depth <= value) {
												if (isUnique(d.source.id, nodes)) {
																nodes.push(d.source);
												}

												if (isUnique(d.target.id, nodes)) {
																nodes.push(d.target);
												}
												links.push(d);
								}
				});
				filtered_data.links = links;
				filtered_data.nodes = nodes;
				filtered_data.nodetype = final_data.nodetype;
				return filtered_data;
}
var fullBtn = document.getElementById("full_data");

if (fullBtn) {
				fullBtn.addEventListener("click", function() {

								document.getElementById('Start_Date').value = "";
								document.getElementById('End_Date').value = "";
								document.getElementById('node').value = "";
								console.log(final_data)

												for(let i=0; i<final_data["nodes"].length; i++){
																final_data["nodes"][i].visible=true;
												}

								d3.select('#Network_graph').selectAll("*").remove();
								makeGraph("#Network_graph", final_data);
				});
}



var newBtn = document.getElementById("date");
if (newBtn) {
				newBtn.addEventListener("click", function() {




								document.getElementById('node').value = ""
												var filtered_data = [];
								var nodes = [];
								var links = [];


								var e1 = document.getElementById('Start_Date');
								var e2 = document.getElementById('End_Date');
								var strUser1 = parseDate(Date.parse(e1.value));
								var strUser2 = parseDate(Date.parse(e2.value));

								d3.selectAll("line").filter(function(d, i) {
												d.sendtime = parseDate(Date.parse(d.sendtime));
												d.paytime = parseDate(Date.parse(d.paytime));
												console.log(d.sendtime);
												console.log(d.paytime);
												if (d.sendtime >= strUser1 && d.sendtime <= strUser2 && d.paytime >= strUser1 && d.paytime <= strUser2) {
																if (isUnique(d.source.id, nodes)) {
																				nodes.push(d.source);
																}

																if (isUnique(d.target.id, nodes)) {
																				nodes.push(d.target);
																}
																links.push(d);
												}
								});
								filtered_data.links = links;
								filtered_data.nodes = nodes;
								filtered_data.nodetype = final_data.nodetype;
								d3.select('#Network_graph').selectAll("*").remove();
								makeGraph("#Network_graph", filtered_data);
								document.getElementById('Start_Date').value = "";
								document.getElementById('End_Date').value = "";

				});
}

var tooltip = d3.select("body")
.append("div")
.attr("class", "tooltip")
.style("opacity", 0);

