import neo4j.v1 as neo
#from py2neo import Graph,Node,Relationship
#from py2neo.packages.httpstream import http
#http.socket_timeout = 99999
import igraph
import pandas as pd
import datetime
#graph = Graph()



class Viz_Connector():

    def __init__(self,ID=None,node_type=None):
        self.ID=ID
        self.node_type=node_type
    def db_connect(self):
        driver=neo.GraphDatabase.driver("bolt://172.31.179.196:7687", auth=neo.basic_auth("neo4j", "c"))
        return driver.session()

    def log(self,stmt):
        with open('db_connector.log','a') as file:
            file.write(stmt+'\n')

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


    def add_depth(self,df,ID,label):
        graph=igraph.Graph(directed=True)
        nodes=df.loc[:,['id1','label1']].rename(columns={'id1':'id','label1':'label'}).append(\
            df.loc[:,['id2','label2']].rename(columns={'id2':'id','label2':'label'}))
        nodes.drop_duplicates(inplace=True)
        edges=df.loc[:,['id1','id2']]
        edges.drop_duplicates(inplace=True)
        graph.add_vertices(nodes['id'].tolist())
        graph.vs['label']=nodes['label'].tolist()
        graph.add_edges(zip(edges.id1,edges.id2))
        v=graph.vs.select(name=ID,label=label)
        n=graph.vs['name']
        sp=graph.shortest_paths(v,mode='ALL')
        d={'id':n,'depth':sp[0]}
        dep=pd.DataFrame(d)
        #dep.replace(np.inf,np.nan,inplace=True)
        #dep.dropna(inplace=True)
        dep.depth=dep.depth.astype(int)
        d1=df.merge(dep,left_on='id1',right_on='id',how='left')['depth']
        d2=df.merge(dep,left_on='id2',right_on='id',how='left')['depth']
        df['depth1']=d1
        df['depth2']=d2
        df['Amount'] = df['Amount'].astype(float)

        df['depth'] = df.loc[:,['depth1','depth2']].apply (max,axis=1)
        df = df.drop(labels=['depth1','depth2'],axis=1)
        df = df.drop_duplicates()
        return df

    def get_data(self,ID=None,node_type=None):
        if ID==None or node_type==None:
            ID=self.ID
            node_type=self.node_type
        if ID==None or node_type==None:
            return 'No Info'

        default_query = """MATCH p = (c:"""+node_type+"""  {ID :'"""+ID+"""'}) - [r:Customer_Send|:Customer_used_ID|:Customer_used_Phone*1..5] - ()
        WITH distinct(p) as p,[node IN NODES(p) WHERE node:Customer] AS customer_nodes
        UNWIND customer_nodes AS c_node 
        OPTIONAL MATCH (c_node) - [r1:Customer_at_Agent] - () 
        Unwind relationships(p) as rr with r1,rr, Collect(distinct(rr)) + Collect(distinct(r1)) as r2 with r2 as r2 Unwind r2 as r3
        with startNode(r3) as s,endNode(r3) as e,r3
        return s.ID as id1,e.ID as id2,labels(s) as label1,labels(e) as label2,r3.Send_Time as SendTime,r3.Pay_Time as PayTime,r3.Amount as Amount
        """
        self.log('Call: '+node_type+'/'+ID+'----------'+str(datetime.datetime.now()))
        t=datetime.datetime.now()
        df=self.query(default_query)
        t=(datetime.datetime.now()-t).total_seconds()
        n=len(df)
        self.log('Return: '+node_type+'/'+ID+' Size: '+str(n)+' Time: '+str(t))

        if df.empty==True:
            return "Wrong ID and Node_type"
        else:
            df=self.add_depth(df,ID,node_type)
            returnObject = df.values.tolist()
            return returnObject


