angular.module('gal.meta', [])

.factory('$meta', function ($language, async, _, S) {

	var meta = {

		keys_POI: {
			it: [
			{
				key: 'tipo_itine',
				value: 'Tipo itinerario'
			},
			{
				key: 'categoria',
				value: 'Categoria'
			},
			{
				key: 'tipologia',
				value: 'Tipologia'
			},
			{
				key: 'proprieta',
				value: 'Proprietà'
			},
			{
				key: 'ente_gestore',
				value: 'Gestore'
			},
			{
				key: 'persona_contatto',
				value: 'Contatto'
			},
			{
				key: 'email',
				value: 'eMail'
			},
			{
				key: 'accessibilita',
				value: 'Accessibilità'
			},
			{
				key: 'utilizzo_attuale',
				value: 'Utilizzo attuale'
			},
			{
				key: 'conservazione',
				value: 'Buono'
			},
			{
				key: 'data_periodo_costruzione',
				value: 'Periodo Costruzione'
			},
			{
				key: 'notizie_storiche',
				value: 'Notizie Storiche'
			},
			{
				key: 'telefono',
				value: 'Telefono'
			},
			{
				key: 'epoca',
				value: 'Epoca'
			}
			],
			en: [
			{
				key: 'tipo_itine',
				value: 'Route'
			},
			{
				key: 'categoria',
				value: 'Category'
			},
			{
				key: 'tipologia',
				value: 'Tipology'
			},
			{
				key: 'epoca',
				value: 'Epoca'
			},
			{
				key: 'property',
				value: 'Property'
			},
			{
				key: 'managing_body',
				value: 'Managing Body'
			},
			{
				key: 'contact_person',
				value: 'Contact Person'
			},
			{
				key: 'opening_hours',
				value: 'Opening Hours'
			},
			{
				key: 'accessibility',
				value: 'Accessibility'
			},
			{
				key: 'current_use',
				value: 'Current Use'
			},
			{
				key: 'constraints',
				value: 'Constraints'
			},
			{
				key: 'conservation',
				value: 'Conservation'
			},
			{
				key: 'period_of_construction',
				value: 'Period of construction'
			},
			{
				key: 'historical_information',
				value: 'Historical Information'
			},
			{
				key: 'telephone number',
				value: 'Telefon Number'
			}
			]
		},

		keys_content: {
			it: [
			{
				key: 'tempi_percorrenza',
				value: 'Tempi di percorrenza'
			},
			{
				key: 'mezzi_consigliati',
				value: 'Mezzi consigliati'
			},
			{
				key: 'partenza',
				value: 'Partenza'
			},
			{
				key: 'arrivo',
				value: 'Arrivo'
			},
			{
				key: 'periodo_consigliato',
				value: 'Periodo consigliato'
			},
			{
				key: 'punti_sosta_accoglienza',
				value: 'Punti sosta accoglienza'
			},
			{
				key: 'lunghezza',
				value: 'Lunghezza (km)'
			}
			],
			en: [
			{
				key: 'difficulty',
				value: 'Difficulty'
			},
			{
				key: 'travel_time',
				value: 'Travel time'
			},
			{
				key: 'recommended_transportation',
				value: 'Raccomended transportation'
			},
			{
				key: 'characteristics',
				value: 'Caratteristiche'
			},
			{
				key: 'departure',
				value: 'Departure'
			},
			{
				key: 'arrival',
				value: 'Arrival'
			},
			{
				key: 'suggested_time',
				value: 'Suggested Time'
			},
			{
				key: 'accommodation_points',
				value: 'Accomodation Points'
			},
			{
				key: 'distance',
				value: 'Distance (km)'
			}
			]
		},
		
		get: function (type, meta, done) {
			
			console.log('get meta information.');

			var meta_list = [];
			var self = this;

			$language.get(function (err, lang) {

				var data;

				if (lang == 'it') {
					if (type == 'content') {
						data = self.keys_content.it;
					} else if (type == 'poi') {
						data = self.keys_POI.it;
					};
				} else if (lang == 'en') {
					if (type == 'content') {
						data = self.keys_content.en;
					} else if (type == 'poi') {
						data = self.keys_POI.en;
					}
				};

				async.each(data, function (item, callback) {

					var o = _.find(meta, function (meta_item) {
						return meta_item.name == item.key;
					});

					if (typeof o != 'undefined') {
						console.log('founded :' + o.name);
						var i = {
							name: item.value,
							value: S(S(o.value).stripTags().s).decodeHTMLEntities().s
						};
						meta_list.push(i);
					};

					callback();

				}, function (err) {
					done(err, meta_list);
				});

			});
		}

	};

	return meta;

});


/*

English

[{"name":"tipo_itine","value":"Paduli route"},
 {"name":"icon-file","value":"civil-architecture.png"},
 {"name":"categoria","value":"Civil architecture"},
 {"name":"tipologia","value":"Palace"},
 {"name":"epoca","value":"Modern"},
 {"name":"property","value":"Municipal"},
 {"name":"managing_body","value":"Comune di Taurisano"},
 {"name":"contact_person","value":"Comune di Taurisano"},
 {"name":"opening_hours","value":"Open"},
 {"name":"accessibility","value":"Accessible"},
 {"name":"current_use","value":"Donated to the church and to the citizens of Taurisano by the will of the heirs of the last owner, Alexander Lopez y Royo, the palace, since 1957, houses the home of the pastor, the public offices and the Municipal Hall of Taurisano."},
 {"name":"y","value":"4427732.375"},
 {"name":"x","value":"773353.103"},
 {"name":"constraints","value":"Vincolo Architettonico"},
 {"name":"conservation","value":"Good"},
 {"name":"period_of_construction","value":"From the 13th century to beginning of 20th century"},
 {"name":"historical_information","value":"<p>The Ducal Palace of Lopez y Royo of Taurisano is located in the same place where, in the thirteenth century, stood the old Angevin fortress, built by the feudal lords of the time, the De Taurisano. The old mansion, however, was damaged and demolished several times between 1733 and 1770.<\/p>"},
 {"name":"audio","value":"http:\/\/blobs.galpuglia.info\/az\/zr\/vy\/blob-azzrvy5r4qvqdovwg1mp3xrf0.data"},{"name":"bibliography_sources","value":"<p>R. Orlando, Taurisano. Guida alla storia, all\u2019arte, al folklore, Galatina 1996.<\/p> \n<p>{Palazzo Ducale Lopez y Royo | http:\/\/www.comune.taurisano.le.it\/territorio\/da-visitare\/item\/palazzo-ducale}<\/p>"},
 {"name":"telephone number","value":"0833626411"},
 {"name":"num_gps","value":"29"},
 {"name":"parent_id","value":"d5c4ef02-1810-11e5-8e6b-97bce16448d8"}]

Italian

[{"name":"tipo_itine","value":"Falesie"},
 {"name":"icon-file","value":"architettura-religiosa.png"},
 {"name":"categoria","value":"Architettura Religiosa"},
 {"name":"tipologia","value":"Convento"},
 {"name":"proprieta","value":"Ecclesiastica"},
 {"name":"ente_gestore","value":"Diocesi di Ugento - Santa Maria di Leuca"},
 {"name":"persona_contatto","value":"Padri Trinitari"},
 {"name":"email","value":"istituto@centroriabilitazione.org"},
 {"name":"accessibilita","value":"Su prenotazione"},
 {"name":"utilizzo_attuale","value":"L'edificio ospita al suo interno una struttura riabilitativa privata."},
 {"name":"y","value":"4415192.902"},
 {"name":"x","value":"788074.103"},
 {"name":"conservazione","value":"Buono"},
 {"name":"data_periodo_costruzione","value":"1640"},
 {"name":"notizie_storiche","value":"<p>La chiesa e il convento vengono ricostruiti a partire dal 1640&nbsp;su una struttura pi&ugrave; antica, di rito greco, intitolata a Sant'Elia. Questo primo edificio religioso, con ogni probabilit&agrave; edificato tra il 1401 e il 1405 per volont&agrave; di Raimondello Del Balzo Orsini, era la Chiesa dell'antico casale di Prusano, oggi scomparso. Il nuovo edificio religioso venne realizzato soprattutto per volont&agrave; della famiglia dei Baroni Castriota Scanderberg, in particolare del Barone Don Giovanni, feudatari di Gagliano, che proprio in San Francesco da Paola avevano il loro&nbsp;protettore.<\/p> \n<p>L\u2019edificio viene costruito dall\u2019Ordine Provinciale dei Minimi, afferente a quello Francescano. Il 1700 fu il secolo di massimo splendore per il convento. Venne fondata una farmacia e una biblioteca, in uso fino al 1809, anno di soppressione del convento.<\/p>"},{"name":"bibliografia_fonti","value":"<p>Mauro Ciardo,&nbsp;<em>Il Castello Baronale di Gagliano del Capo: La fortezza medieavale, il palazzo signorile, l'oratorio parrocchiale<\/em>, Pensa Editore, 2006.<br \/> Mauro Ciardo,&nbsp;<em>La storia di Gagliano del Capo. Il Cinquecento<\/em>, Pensa Editore, 2005.<br \/> Mauro Ciardo,&nbsp;<em>La storia di Gagliano del Capo dall'et&agrave; romana al medioevo<\/em>, Pensa Editore, 2004.<br \/> Francesco Fersini,&nbsp;<em>Gagliano del Capo. Percorso storico attraverso i secoli<\/em>, Libellula Edizioni, 2010.<\/p>"},
 {"name":"telefono","value":"+390833797111"},
 {"name":"num_gps","value":"91"},
 {"name":"epoca","value":"Moderna"}]

*/