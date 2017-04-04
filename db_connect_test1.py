import neo4j.v1 as neo
import igraph
import pandas as pd
execfile('/mnt/storage/graph_calc/Graph_Handler.py')
execfile('Graph_Score.py')


class Viz_Connector():

    def __init__(self,ID=None,node_type=None,port=7687):
        self.ID=ID
        self.node_type=node_type
        self.port=port
    def db_connect(self):
        port=self.port
        driver=neo.GraphDatabase.driver("bolt://localhost:"+str(port), auth=neo.basic_auth("neo4j", "c"))
        return driver.session()

    def query(self,query):
        session=self.db_connect()
        def dummy(x):
            if type(x)==list:
                x=x[0]
            return x
        res=session.run(query)
        cols=res.keys()
        v=[i.values() for i in res]
        v=map(lambda x:[dummy(i) for i in x],v)
        df=pd.DataFrame(v,columns=cols)
        session.close()
        return df

    def score(self,graph):
        gs=Graph_Score(graph,stream_log='Web_Score.log')
        functions={'cluster_size':gs.cluster_size,\
            'cluster_number':gs.cluster_number,\
            'degree_in':{'fn':gs.graph.degree,'params':{'mode':'IN'}},\
            'degree_out':{'fn':gs.degree,'params':{'mode':'OUT'}},\
            'degree_total':{'fn':gs.degree,'params':{'mode':'ALL'}},\
            'eccentricity':{'fn':gs.graph.eccentricity,'params':{'mode':'IN'}},\
            'diversity':gs.diversity,\
            'page_rank':gs.graph.personalized_pagerank,\
            'closeness':{'fn':gs.graph.closeness,'params':{'cutoff':5,'normalized':True}},\
            'betweenness':{'fn':gs.graph.betweenness,'params':{'weights':'Amount','cutoff':5}},\
            'neighborhood_size':{'fn':gs.neighborhood_size,'params':{'order':5}}
            }
        score=gs.nodes_score(functions)
        return score

    def as_igraph(self,df,ID,label):
        graph=make_graph(df,node_dic={'Customer':['id1','id2']},\
                    pairs={'Customer_Send':['id1','id2']},attr_cols=['Amount'])
        v=graph.vs.select(name=ID,type=label)
        v['Score']=1
        return graph

    def depth(self,graph):
        v=graph.vs.select(Score=1)
        n=graph.vs['name']
        sp=graph.shortest_paths(v,mode='ALL')
        d={'id':n,'depth':sp[0]}
        dep=pd.DataFrame(d)
        #dep.replace(np.inf,np.nan,inplace=True)
        #dep.dropna(inplace=True)
        dep.depth=dep.depth.astype(int)
        return dep

    def get_data(self,ID=None,node_type=None):
        if ID==None or node_type==None:
            ID=self.ID
            node_type=self.node_type
        if ID==None or node_type==None:
            return 'No Info' 
        print ID,node_type
#        default_query = """MATCH p = (c:"""+node_type+""" {ID :'"""+ID+"""'}) - [r:Customer_Send|:Customer_used_ID|:Customer_used_Phone*1..5] - ()
#        WITH distinct(p) as p,[node IN NODES(p) WHERE node:Customer] AS customer_nodes
#        UNWIND customer_nodes AS c_node 
#        OPTIONAL MATCH (c_node) - [r1:Customer_at_Agent] - () 
#        Unwind relationships(p) as rr with r1,rr, Collect(distinct(rr)) + Collect(distinct(r1)) as r2 with r2 as r2 Unwind r2 as r3
#        with startNode(r3) as s,endNode(r3) as e,r3
#        return s.ID as id1,e.ID as id2,labels(s) as label1,labels(e) as label2,r3.Send_Time as SendTime,r3.Pay_Time as PayTime,r3.Amount as Amount
#        """
        default_query="match (c:"+node_type+"{ID:'"+ID+"'}) with c call apoc.path.expand(c,'Customer_used_ID|Customer_used_Phone|Customer_Send','',1,3) yield path as p with p unwind relationships(p) as rr with distinct rr as r with startNode(r) as s, endNode(r) as e, r return s.ID as id1,e.ID as id2,labels(s) as label1,labels(e) as label2,r.Send_Time as SendTime,r.Pay_Time as PayTime,r.Amount as Amount"
        df=self.query(default_query)
        if len(df)!=0:
            ig=self.as_igraph(df,ID,node_type)
         #   score=self.score(ig)
            depth=self.depth(ig)
            d1=df.merge(depth,left_on='id1',right_on='id',how='left')['depth']
            d2=df.merge(depth,left_on='id2',right_on='id',how='left')['depth']
            df['depth1']=d1
            df['depth2']=d2
          #  df=df.merge(score,left_on='id2',right_index=True,how='left')
        return df


