import neo4j.v1 as neo
import igraph
import pandas as pd
driver=neo.GraphDatabase.driver("bolt://localhost:7687", auth=neo.basic_auth("neo4j", "c"))
session = driver.session()
#'CHB1737642'
query = """MATCH p = (c:Customer  {ID :'D1'}) - [r:Customer_Send|:Customer_used_ID|:Customer_used_Phone*1..5] - ()
 WITH distinct(p) as p,[node IN NODES(p) WHERE node:Customer] AS customer_nodes
 UNWIND customer_nodes AS c_node
 OPTIONAL MATCH (c_node) - [r1:Customer_at_Agent] - ()
 Unwind relationships(p) as rr with r1,rr, Collect(distinct(rr)) + Collect(distinct(r1)) as r2 with r2 as r2 Unwind r2 as r3
 with startNode(r3) as s,endNode(r3) as e,r3
 return s.ID as id1,e.ID as id2,labels(s) as label1,labels(e) as label2,r3.Send_Time as SendTime,r3.Pay_Time as PayTime,r3.Amount as Amount"""
def dummy(x):
    if type(x)==list:
        x=x[0]
    return x
res=session.run(query)
cols=res.keys()
v=[i.values() for i in res]
v=map(lambda x:[dummy(i) for i in x],v)
df=pd.DataFrame(v,columns=cols)

graph=igraph.Graph(directed=True)
nodes=df.loc[:,['id1','label1']].rename(columns={'id1':'id','label1':'label'}).append(\
        df.loc[:,['id2','label2']].rename(columns={'id2':'id','label2':'label'}))
nodes.drop_duplicates(inplace=True)
edges=df.loc[:,['id1','id2']]
edges.drop_duplicates(inplace=True)
graph.add_vertices(nodes['id'].tolist())
graph.vs['label']=nodes['label'].tolist()
graph.add_edges(zip(edges.id1,edges.id2))
v=graph.vs.select(name='D1',label='Customer')
n=graph.vs['name']
sp=graph.shortest_paths(v,mode='ALL')
d={'id':n,'depth':sp[0]}
dep=pd.DataFrame(d)
dep.depth=dep.depth.astype(int)
d1=df.merge(dep,left_on='id1',right_on='id',how='left')['depth']
d2=df.merge(dep,left_on='id2',right_on='id',how='left')['depth']
df['depth1']=d1
df['depth2']=d2
df['Amount'] = df['Amount'].astype(float)
def final_depth(row):
    if row['depth1']>row['depth2']:
        return row['depth1']
    else:
        return row['depth2']
df['depth'] = df.apply (lambda row: final_depth(row),axis=1)
df = df.drop_duplicates()
print df[df['depth']==6]







