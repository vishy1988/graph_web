$('input[type=submit]').click(function() {
				var input_ID= $("#input_ID").val();
				var Node_Type= $("#Node_Type").val();

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
																group: 1
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

function makeGraph(selector, d3GraphData) {
				console.log(d3GraphData)



								var width = 1160,
								height = 700,
								radius = 6;
				d3.selectAll("svg > *").remove();
				var svg = d3.select(selector).append("svg")
								.attr("width", width)
								.attr("height", height);



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
								.attr("stroke-width", 8)
								.attr("class", "link")
								.style("opacity", 1)

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
				.each(function(d) {
								filtered.push(d.id);
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
								        

			



				d3.selectAll("input[name=checkb]").on("change", function() {
								function getCheckedBoxes(chkboxName) {
												var checkboxes = document.getElementsByName(chkboxName);
												var checkboxesChecked = [];
												for (var i = 0; i < checkboxes.length; i++) {
																if (checkboxes[i].checked) {
																				checkboxesChecked.push(checkboxes[i].defaultValue);
																}

												}
												return checkboxesChecked.length > 0 ? checkboxesChecked : " ";
								}

								var checkedBoxes = getCheckedBoxes("checkb");

								node.style("opacity", 1);
								link.style("opacity", 1);

								node.filter(function(d) {
												return checkedBoxes.indexOf(d.type) === -1;
								})
								.style("opacity", "0");

								link.filter(function(d) {
												return checkedBoxes.indexOf(d.source.type) === -1 ||
																checkedBoxes.indexOf(d.target.type) === -1;
								})
								.style("opacity", "0");

								link.filter(function(d) {
												return checkedBoxes.indexOf(d.source.type) > -1 &&
																checkedBoxes.indexOf(d.target.type) > -1;
								})
								.style("opacity", "1");


				});


				var typeAgentChk = document.querySelectorAll('input[value="Agent"]')[0];
				var typeCustomerChk = document.querySelectorAll('input[value="Customer"]')[0];
				var typePhoneChk = document.querySelectorAll('input[value="Phone"]')[0];
				var typeIDCardChk = document.querySelectorAll('input[value="ID_Card"]')[0];

				var checkBoxes = [typeAgentChk, typeCustomerChk, typePhoneChk, typeIDCardChk];
				var nodeTypes = ["Agent", "Customer", "Phone", "ID_Card"];


				var filterByCheckBox = function(el) {
								if (el.checked) {

												filterBy("type", el.value, false);
								} else {
												removeFilterFor("type", el.value);
								}
				}

				var removeFilterFor = function(attribute, value) {
								var node = svg.selectAll(".node");
								var link = svg.selectAll(".link");
								var selected = node.filter(function(d) {
												return d[attribute] == value;
								})
								.style("opacity", 0)
												.each(function(d) {
																var index = filtered.indexOf(d.id);
																if (index > -1) {
																				filtered.splice(index, 1);
																}
												});
				}
				var filterBy = function(attribute, value, restoreAll, highlightSelected) {

								var node = svg.selectAll(".node");
								var link = svg.selectAll(".link");
								if (value == "none" || value == null) {
												node.style("stroke", "white").style("stroke-width", "1");
								} else {
												var selected = node.filter(function(d) {
																return d[attribute] == value;
												});


												var alreadyFiltered = node.filter(function(d) {
																return filtered.indexOf(d.id) > -1;
												})
												var alreadyFilteredLinks = link.filter(function(d) {
																return filtered.indexOf(d.source.id) > -1 && filtered.indexOf(d.target.id) > -1;
												})

												node.style("opacity", 0);
												link.style("opacity", 0);
												if (highlightSelected) {

																svg.selectAll(".node, .link").transition()
																				.duration(1000)
																				.style("opacity", 0);
												}
												selected.style("opacity", 1)
																.each(function(d) {
																				if (filtered.indexOf(d.id) == -1) {
																								filtered.push(d.id);
																				}
																});


												alreadyFiltered.transition()
																.duration(3000)
																.style("opacity", 1);
												alreadyFilteredLinks.transition()
																.duration(3000)
																.style("opacity", 1);



												if (restoreAll) {
																filtered = [];
																svg.selectAll(".node, .link").transition()
																				.duration(5000)
																				.style("opacity", 1);
												}
								}
				}

				for (let i = 0; i < checkBoxes.length; i++) {
								checkBoxes[i].checked = true;

								checkBoxes[i].addEventListener("click", function() {
												filterByCheckBox(checkBoxes[i])
								});
				}

				if(searchBtn) {				searchBtn.addEventListener("click", function() {

								document.getElementById('Start_Date').value = "";
								document.getElementById('End_Date').value = "";

								var selectedVal = document.getElementById('node').value;
								if (nodeTypes.indexOf(selectedVal) > -1) {
												filterBy("type", selectedVal, false);
								} else {
												console.log("filterBy", "id", selectedVal)
																filterBy("id", selectedVal, false, true);
								}
				});
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

								console.log(strUser1);
								console.log(strUser2);

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
				});
}





var tooltip = d3.select("body")
.append("div")
.attr("class", "tooltip")
.style("opacity", 0);


