from db_connect import Viz_Connector
from flask import Flask, request, session, redirect, url_for, render_template, flash,json,jsonify
from flask_cors import CORS, cross_origin

#execfile('dec.py')

app = Flask(__name__)
CORS(app)



#@crossdomain(origin='*')

@app.route('/<node_type>/<node_id>')
@cross_origin()
def select_ID(node_type,node_id):
    #ID=request.json['ID']
    #Node_type = request.json['Node_Type']
    data = Viz_Connector(node_id,node_type).get_data()
    return  jsonify(data)
#    return node_type+node_id

if __name__ == '__main__':
  app.run(host='0.0.0.0')


