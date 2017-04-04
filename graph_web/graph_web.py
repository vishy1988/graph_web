import db_connect_test
from db_connect_test import Viz_Connector
from flask import Flask, request, session, redirect, url_for, render_template, flash,json,jsonify
import os
app = Flask(__name__)
@app.route('/',methods = ['GET','POST'])
def select_ID():
    if request.method == 'POST':
        ID=request.form['input_ID']
        Node_type = request.form['Node_Type']
        data = Viz_Connector(ID,Node_type).get_data()
        return  jsonify(data)
    return render_template('dropdown.html')



if __name__ == '__main__':
    app.run(host='0.0.0.0')


