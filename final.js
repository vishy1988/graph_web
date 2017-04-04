

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



function createNodes(startnodes, endnodes, startnodetype, endnodetype,SendTime, PayTime,Total_Amt,Depth) {
				var node_set = [];
				var links = [];
				var nodetype = d3.set();
				startnodes.forEach(function(src, i) {
								var tgt = endnodes[i];
								if (!node_set.find(function(d){ return d.id == src})){
												node_set.push({
																id: src,
																type: startnodetype[i]

												});
								}
								if (!node_set.find(function(d){ return d.id == tgt})){
												node_set.push({
																id: tgt,
																type: endnodetype[i]
												});
								}
								var strength=0
								if(startnodetype[i]==endnodeType[i]){
										strength=.1						
								}else {
										strength=10
								}
								

								links.push({
												source: src,
												target: tgt,
												sendtime: SendTime[i],
												paytime: PayTime[i],
												total_amt: Total_Amt[i],
												depth: Depth[i],
												value: 1,
												strength: strength
																)
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

				var width = 1160,
				height = 700,
								radius = 6;
				d3.selectAll("svg > *").remove()
								var svg = d3.select(selector).append("svg")
								.attr("width", width)
								.attr("height", height);


				var color = d3.scaleOrdinal(d3.schemeCategory10);

				var simulation = d3.forceSimulation()
								.force("link", d3.forceLink().id(function(d) {
												return d.id;
								}).distance(60).strength(function(d) {
											return d.strength
								})
									)
								.force("gravity",gravity(0.25));
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
								.attr("stroke-width", function(d) {
												return Math.sqrt(d.value);
								})

				.on('mouseover', function(d) {

								var thisSource = d.source.id,
								thisTarget = d.target.id;
								var filteredLinks = d3GraphData.links.filter(function(e) {
												return (e.source.id === thisSource && e.target.id === thisTarget) 
																|| (e.source.id === thisTarget && e.target.id === thisSource);
								});



								tooltip.html("");

								var list = tooltip.selectAll(".list")
												.data(filteredLinks)
												.enter()
												.append("div");

								list.html(function(d){
												console.log(d);
												return "Paytime: " + d.paytime + "<br>Sendtime: " + d.sendtime 
																+ "<br>Amount: " + d.total_amt + "<br>Depth: " + d.depth + "<br><br>";
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
								.attr("r", 5)
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

				.call(d3.drag()
												.on("start", dragstarted)
												.on("drag", dragged)
												.on("end", dragended));



				simulation
								.nodes(d3GraphData.nodes)
								.on("tick", ticked);

				simulation.force("link")
								.links(d3GraphData.links);



				d3.selectAll("input[name=checkb]").on("change", function() {
								function getCheckedBoxes(chkboxName) {
												var checkboxes = document.getElementsByName(chkboxName);
												var checkboxesChecked = [];
												for (var i=0; i<checkboxes.length; i++) {
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
								.style("opacity", "0.2");

								link.filter(function(d) {
												return checkedBoxes.indexOf(d.source.type) === -1 || 
																checkedBoxes.indexOf(d.target.type) === -1;
								})
								.style("opacity", "0.2");

								link.filter(function(d) {
												return checkedBoxes.indexOf(d.source.type) > -1 && 
																checkedBoxes.indexOf(d.target.type) > -1;
								})
								.style("opacity", "1");


				});






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
var filtered_data = [];
var myBtn = document.getElementById("depth");

if (myBtn){
				myBtn.addEventListener("click", function(){

								var nodes = [];
								var links = [];

								var e = document.getElementById("select_ID");
								var strUser = e.options[e.selectedIndex].value;
								console.log(strUser);
								d3.selectAll("line").filter(function(d, i) {
												if (d.depth <= strUser) {
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
var fullBtn = document.getElementById("full_data");

if (fullBtn)
{
				fullBtn.addEventListener("click", function() {

								d3.select('#Network_graph').selectAll("*").remove();
								makeGraph("#Network_graph", final_data);
				});
}
var parseDate = d3.timeFormat('%Y-%m-%d %H:%M:%S');
var newBtn = document.getElementById("date");
if (newBtn){
				newBtn.addEventListener("click", function(){

								var nodes = [];
								var links = [];

								var e = document.getElementById("select_ID");
								var e1 = document.getElementById('Start_Date');
								var e2 = document.getElementById('End_Date');
								var strUser1 =  parseDate(Date.parse(e1.value)); 
								var strUser2 = parseDate(Date.parse(e2.value));

								console.log(strUser1);
								console.log(strUser2);

								d3.selectAll("line").filter(function(d, i) {
												d.sendtime = parseDate(Date.parse(d.sendtime));
												d.paytime = parseDate(Date.parse(d.paytime));
												console.log(d.sendtime);
												console.log(d.paytime);
												if (d.sendtime >= strUser1 && d.sendtime <= strUser2 &&d.paytime>=strUser1 &&d.paytime<=strUser2) {
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




