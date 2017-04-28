FROM debian



COPY certs/* /usr/share/ca-certificates/

RUN apt-get update && apt-get install -y python python-dev python-pip python-distribute
RUN apt-get install -y build-essential libxml2-dev libglpk-dev libgmp3-dev liblas-dev liblapack-dev libarpack2-dev 
RUN apt-get install -y libigraph0 libigraph0-dev
RUN apt-get install -y nginx
RUN apt-get install -y gunicorn
#RUN apt-get update

RUN pip install --cert=/usr/share/ca-certificates/wu-cer-1.crt neo4j-driver 
RUN pip install --cert=/usr/share/ca-certificates/wu-cer-1.crt python-igraph 
RUN pip install --cert=/usr/share/ca-certificates/wu-cer-1.crt flask 
RUN pip install --default-timeout=120 --cert=/usr/share/ca-certificates/wu-cer-1.crt numpy 
RUN pip install --default-timeout=120 --cert=/usr/share/ca-certificates/wu-cer-1.crt pandas 
RUN pip install --cert=/usr/share/ca-certificates/wu-cer-1.crt --upgrade pip 

COPY graph_web/ /



#ENTRYPOINT ["exec gunicorn -w 4 -b '0.0.0.0:5002' graph_web:app"]
#ENTRYPOINT ["/start.sh]










