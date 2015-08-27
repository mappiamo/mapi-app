var Config = {

	data: {
		_id: 'config',
		_rev: '',
		download: false,
		DB: {
			name: 'galleuca'
		},

		MAPPIAMO: {
	  		jsonp: '&callback=JSON_CALLBACK',
	  		content: 'http://web.galpuglia.info/index.php?module=api&task=content&object=',
	  		poi: 'http://web.galpuglia.info/index.php?module=api&task=category&object='    
		}
	},
	
	load: function (done) {

		var self = this;

        pdb.open(this.data.DB.name, function (db_callback) {
            var db = db_callback;
            pdb.get(db, 'config', function (err, doc) {
              if (!err) {
              	self.data = doc
                done(err, self.data);
              } else {
                self.save(self.data, function(err) {
                  done(err, self.data);
                });
              }
            })
        });

	}, 

	save: function (config_data, done) {

		var self = this;

        pdb.open(this.data.DB.name, function (db_callback) {
            var db = db_callback;
            
            self.data = config_data;

            pdb.put(db, self.data, function (err, result) {
              console.log(JSON.stringify(result));
              done(err);
            })
        });

	}
};
