var linksData;

$('input[type=submit]').click(function() {
				$('#slow_warning').show();
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
																$('#slow_warning').hide();

																window.final_data = createNodes(startnodes, endnodes, startnodetype, endnodetype, SendTime,PayTime, Total_Amt, Depth);
																makeGraph("#Network_graph", final_data);
																linksData = d3.selectAll("line").data();

								}
				});
				return false;
});




var searchBtn = document.getElementById("search");
var parseDate = d3.timeFormat('%Y-%m-%d %H:%M:%S');

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
								.attr("height", height)
								.call(d3.zoom().on("zoom", function () {
												svg.attr("transform", d3.event.transform)
								}))
				.append("g")

								var lineX2 = function(d) {


												if (d.total_amt<=30){ var mw = 1} else if (d.total_amt>30 && d.total_amt<=100){ mw = 3.5}               else if (d.total_amt > 100 && d.total_amt <=200) {mw=5} else if (d.total_amt >200 && d.total_amt<=400) {mw=7.5}
												else if (d.total_amt > 400 && d.total_amt <=600) {mw=11} else if (d.total_amt > 600 && d.total_amt <=800) {mw=14.5} else if (d.total_amt > 800 && d.total_amt <=1100) {mw=18}  else {mw = 24};

												ms = Math.sqrt((mw * mw) + (mw * mw)) * 1.2;

												var weight = d.target.inDegree ? d.target.inDegree : 0 + d.target.outDegree ? d.target.outDegree : 0;
												weight = weight*3;



												var r = weight + ms;

												var length = Math.sqrt(Math.pow(d.target.y - d.source.y, 2) + Math.pow(d.target.x - d.source.x, 2));
												var scale = (length - r) / length;
												var offset = (d.target.x - d.source.x) - (d.target.x - d.source.x) * scale;
												return d.target.x - offset;
								};
				var lineY2 = function(d) {


								if (d.total_amt<=30){ var mw = 1} else if (d.total_amt>30 && d.total_amt<=100){ mw = 3.5}               else if (d.total_amt > 100 && d.total_amt <=200) {mw=5} else if (d.total_amt >200 && d.total_amt<=400) {mw=7.5}
								else if (d.total_amt > 400 && d.total_amt <=600) {mw=11} else if (d.total_amt > 600 && d.total_amt <=800) {mw=14.5} else if (d.total_amt > 800 && d.total_amt <=1100) {mw=18}  else {mw = 24};

								ms = Math.sqrt((mw * mw) + (mw * mw)) * 1.2;

								var weight = d.target.inDegree ? d.target.inDegree : 0 + d.target.outDegree ? d.target.outDegree : 0;

								weight = weight * 3;
								var r = weight + ms;

								var length = Math.sqrt(Math.pow(d.target.y - d.source.y, 2) + Math.pow(d.target.x - d.source.x, 2));
								var scale = (length - r) / length;
								var offset = (d.target.y - d.source.y) - (d.target.y - d.source.y) * scale;
								return d.target.y - offset;
				};

				svg.append("svg:defs").selectAll("marker")
								.data(["end"]) 
								.enter().append("svg:marker") 
								.attr("id", String)
								.attr("viewBox", "0 0 10 10")
								.attr("refX", "0")
								.attr("refY", "5")
								.attr("markerUnits", "strokeWidth")
								.attr("markerWidth", "7")
								.attr("markerHeight", "2")
								.attr("orient", "auto")
								.append("svg:path")
								.attr("d", "M 0 0 L 10 5 L 0 10 z")


								var color = d3.scaleOrdinal(d3.schemeCategory10);
				var radius = function(d) { var weight = d.inDegree ? d.inDegree : 0 + d.outDegree ? d.outDegree : 0;
								weight = weight * 3;
								return weight;}


				var simulation = d3.forceSimulation()
								.force("link", d3.forceLink().id(function(d) {
												return d.id;
								}).distance(150).strength(1))
				.force("charge", d3.forceManyBody())
								.force("center", d3.forceCenter(width / 2, height / 2))
								.force("gravity", gravity(0.25))
				.force("collide",
												d3.forceCollide()
												.strength(1)
												.radius(radius)
												.iterations(15)
							);

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
								.attr("stroke-width",function(d){ if (d.total_amt<=30){ var mw = 1} else if (d.total_amt>30 && d.total_amt<=100){ mw = 3.5}               else if (d.total_amt > 100 && d.total_amt <=200) {mw=5} else if (d.total_amt >200 && d.total_amt<=400) {mw=7.5}
												else if (d.total_amt > 400 && d.total_amt <=600) {mw=11} else if (d.total_amt > 600 && d.total_amt <=800) {mw=14.5} else if (d.total_amt > 800 && d.total_amt <=1100) {mw=18}  else {mw = 24};return  mw;} )
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

								.on('dblclick', connectedNodes)
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








				var Agent_node = node.filter(function(d) {
								return d.type == "Agent";
				});
				Agent_node
								.style("fill", "orange")
								.attr("class", "node")

								.style("opacity", function(d) {
												return getOpacity(d)
								});



				var Customer_node = node.filter(function(d) {
								return d.type == "Customer";
				});
				Customer_node
								.style("fill", "blue")
								.attr("class", "node")


								.style("opacity", function(d) {
												return getOpacity(d)
								});

				var Phone_node = node.filter(function(d) {
								return d.type == "Phone";
				});
				Phone_node
								.style("fill", "green")
								.attr("class", "node")

								.style("opacity", function(d) {
												return getOpacity(d)
								});

				var ID_node = node.filter(function(d) {
								return d.type == "ID_Card";
				});
				ID_node
								.style("fill", "red")
								.attr("class", "node")

								.style("opacity", function(d) {
												return getOpacity(d)
								});





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

				var toggle = 0;

				var linkedByIndex = {};
				for (i = 0; i < d3GraphData.nodes.length; i++) {
								linkedByIndex[i + "," + i] = 1;
				};
				d3GraphData.links.forEach(function (d) {
								linkedByIndex[d.source.index + "," + d.target.index] = 1;
				});

				function neighboring(a, b) {
								return linkedByIndex[a.index + "," + b.index];
				}

				function connectedNodes() {
								d3.select(this).style("stroke","black")
												d = d3.select(this).node().__data__;


								if (!d.clicked) {

												d.clicked = true;

												node.style("opacity", function (o) {

																return neighboring(d, o) || neighboring(o, d) 
																				? 1 
																				: 0;


												})





												link.style("opacity", function (o) {
																return d.index==o.source.index | d.index==o.target.index ? 1 : 0;
												});

								} else {
												d.clicked = !d.clicked;

												node.style("opacity", function(o){
																return o.visible? 1 :  0;
												});
												link.style("opacity", function(o){
																return o.target.visible && o.source.visible? 1:0;
												});

												d3.select(this).style("stroke","")
								}

				}


				node.each(function(d) {
								d.inDegree = 0;
								d.outDegree = 0;
				});

				lines.each(function(d) {
								d.source.outDegree += 1;
								d.target.inDegree += 1;
				});

				node.attr("r",function(d){ var weight = d.inDegree ? d.inDegree : 0 + d.outDegree ? d.outDegree : 0;
								weight = weight * 3;
								return weight;});

				var ID = document.getElementById("input_ID").value;

				var origin = node.filter(function(d) {
								return d.id == ID;
				});
				origin
								.style("fill", "black")
								.attr("class", "node")

								.style("opacity", function(d) {
												return getOpacity(d)
								});



				function ticked() {
								link
												.attr("x1", function(d) {
																return d.source.x;
												})
								.attr("y1", function(d) {
												return d.source.y;
								})
								.attr("x2", lineX2)
												.attr("y2", lineY2)

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


var agentCheckbox = $("#Agent");
var customerCheckbox = $("#Customer");
var phoneCheckbox = $("#Phone");
var idCheckbox = $("#ID_Card");

var AgentChecked = true;
var CustomerChecked = true;
var PhoneChecked = true;
var IDChecked = true;


agentCheckbox.click(function() {
				var $this = $(this);
				AgentChecked = $this.prop("checked");
});
customerCheckbox.click(function() {
				var $this = $(this);
				CustomerChecked = $this.prop("checked");
});
phoneCheckbox.click(function() {
				var $this = $(this);
				PhoneChecked = $this.prop("checked");
});
idCheckbox.click(function() {
				var $this = $(this);
				IDChecked = $this.prop("checked");
});


var elem = document.getElementById('select_ID');
elem.addEventListener("change", onSelectChange);

var updateChkBoxesOnSelectChange = function(data) {
				console.log(AgentChecked);
				console.log(CustomerChecked);
				console.log(PhoneChecked);
				console.log(IDChecked);

				if (!AgentChecked) {
								agentCheckbox.prop("checked", false);
				}
				if (!CustomerChecked) {
								customerCheckbox.prop("checked", false);
				}
				if (!PhoneChecked) {
								phoneCheckbox.prop("checked", false);
				}
				if (!IDChecked) {
								idCheckbox.prop("checked", false);
				}
}


function onSelectChange() {
				document.getElementById('Start_Date').value = "";
				document.getElementById('End_Date').value = "";
				document.getElementById('node').value = "";

				var value = this.value;
				var fdata = filteredData(value);
				d3.select('#Network_graph').selectAll("*").remove();
				makeGraph("#Network_graph", fdata);
				updateChkBoxesOnSelectChange(fdata.nodes);

}

function filteredData(value) {
				var filtered_data = {};
				var nodes = [];
				var links = [];

				linksData.filter(function(d, i) {
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
								updateChkBoxesOnSelectChange(filtered_data.nodes);
								document.getElementById('Start_Date').value = "";
								document.getElementById('End_Date').value = "";

				});
}

var tooltip = d3.select("body")
.append("div")
.attr("class", "tooltip")
.style("opacity", 0);

