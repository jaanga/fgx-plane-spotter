
	var displayDiagrams = true;
	var diagrams;

	var icaoFileName = '../apt1000/apt1000-icao.csv';
	var icaoGazetteer;
	var icaoIndex;

	var ilsStartPlace;
	var ilsFileName = '../apt1000/apt1000-ils.csv';
	var ilsGazetteer;

	var navaidsFileName = '../apt1000/apt1000-nav.csv';
	var heliFileName = '../apt1000/apt1000-heli.csv';
	var seaFileName = '../apt1000/apt1000-sea.csv';

	function addNavaids() {
		var data = requestFile( icaoFileName );
		var lines = data.split(/\r\n|\n/);
		icaoGazetteer = [];
		ilsGazetteer = [ [ 'sf','San Francisco Bay','','','','' ] ];
		var record;
		for ( var i = 1, length = lines.length - 1; i < length; i++ ) {
			pl = lines[i].split( ',' ) ;
			record = [ pl[0], pl[1], parseFloat( pl[2] ), parseFloat( pl[3] ), pl[4], pl[5] ];
			icaoGazetteer.push( record);
			// icaoIndex.push( pl[0] );
			if ( pl[5] !== '0' ) {
				ilsGazetteer.push( record );
				
			}
		}

		navaidsDiv = document.body.appendChild( document.createElement( 'div' ) );
		navaidsDiv.id = 'movable';
		navaidsDiv.style.cssText = ' background-color: #ccc; height: 180px; right: 20px; opacity: 0.8; bottom: 400px; width: 300px; ';
		navaidsDiv.addEventListener( 'mousedown', mouseMove, false );
		navaidsDiv.innerHTML = navaidsText = 
			'<div id=closer onclick=crossfeedDiv.style.display="none"; >[x]</div>' +
			'<h2>FGx Navaids</h2>' +
			'<p><select id=selILS></select> <select id=selGoodies ></select></p>' +
			'<p><input id=chkdiagrams type="checkbox" onchange=updateDiagrams(); >Diagrams</p>' +
			'<p><a href=JavaScript:cameraToATC(); >Camera to ATC</a></p>' +
		'';

//		var goodies = [[ 'sonNabisco','KSFO'], ['heatLow','EGLL'], ['hampsterDam','EHAM'], ['adLanda','KATL'], 
//			['nudeJoke','KJFK'], ['fromage','LFPG'], ['zooWreck','LSZH'], ['noRider','RJAA'] ];
		var goodies = [ 'KSFO','EGLL','EHAM','KATL','KJFK','LFPG','LSZH','RJAA','NZQN'];
		for ( i = 0, length = ilsGazetteer.length; i < length; i++ ) {
			pl = ilsGazetteer[i];
			selILS.appendChild( document.createElement( 'option' ) );
			selILS.children[ i ].text = pl[0];
			selILS.children[ i ].title = pl[1];
			if ( pl[0] === 'KSFO' ) ilsStartPlace = i;
			if ( goodies.indexOf( pl[0] ) > -1 ) {
				selGoodies.appendChild( document.createElement( 'option' ) );
				selGoodies.children[ selGoodies.children.length - 1].text = pl[0];
				selGoodies.children[ selGoodies.children.length - 1].title = pl[1];
				selGoodies.children[ selGoodies.children.length - 1].pointer = i;
			}
		}
		selILS.selectedIndex = ilsStartPlace;

		selILS.onchange = function() {
			ilsStartPlace = this.selectedIndex;
			uf.startPlace = 0;
			uf.setCamera();
			inpLat.value = uf.lat = ilsGazetteer[ ilsStartPlace ][2];
			inpLon.value = uf.lon = ilsGazetteer[ ilsStartPlace ][3];
			updateMenu(); 
		};

		selGoodies.selectedIndex = 4;
		selGoodies.onchange = function() { selILS.selectedIndex = selGoodies[ selGoodies.selectedIndex].pointer; selILS.onchange(); };

		chkdiagrams.checked = displayDiagrams;
	}

	function cameraToATC() {
		if ( ilsStartPlace ) {
			var scale = 0.5 * uf.scaleVertical * uf.zoomScales[ uf.zoom ][1];

			var place = ilsGazetteer[ ilsStartPlace ];
			var lat = parseFloat( place[2] ); 
			var lon = parseFloat( place[3] ); 
			var alt = getAltitude( lat, lon );
			alt = uf.scaleVerticalCurrent * alt;

			inpTarAlt.value = uf.tarAlt = alt;
			inpTarLat.value = uf.tarLat = lat;
			inpTarLon.value = uf.tarLon = lon;

			inpCamAlt.value = uf.camAlt = alt;
			inpCamLat.value = uf.camLat = lat - 0.03;
			inpCamLon.value = uf.camLon = lon;

			updateCameraTarget();
		} else {
			messages.innerHTML = '<small style=color:red; >Please select an airport...</small>';
		}
	}

	function updateDiagrams() {
		if ( diagrams && diagrams.children.length > 0) {
			uf.scene.remove( diagrams );
			diagrams.children.length = 0;
		}
		if ( !chkdiagrams.checked || uf.zoom < 8 ) {
			displayDiagrams = 0;
			return;
		} else {
			displayDiagrams = 1;
		}
		diagrams = new THREE.Object3D();

		var place, lat, lon;
		var pointStart = uf.getPoint( uf.lat, uf.lon, uf.zoom );
		var alt, point, mesh, run;
		var off = uf.tilesPerSide % 2 > 0 ? -128 : -256;
//		var scale = 0.5 * uf.scaleVertical * uf.zoomScales[ uf.zoom ][1];

		var distance = 0.0002 * uf.camera.position.distanceTo( uf.controls.target );
		var scalePlacard = distance < 0.25 ? 0.25 : distance;

		for ( var i = 1, iLen = icaoGazetteer.length; i < iLen; i++ ) {
			place = icaoGazetteer[i];
			lat = place[2]; 
			lon = place[3];
			if ( lat < uf.ulLat && lat > uf.lrLat && lon > uf.ulLon && lon < uf.lrLon ) {

				point = uf.getPoint( lat, lon, uf.zoom );
				point.ptX += off + uf.tileSize * ( point.tileX - pointStart.tileX );
				point.ptY += off + uf.tileSize * ( point.tileY - pointStart.tileY );

				alt = getAltitude( lat, lon );
				point.alt = uf.scaleVerticalCurrent * alt;

				mesh = drawObject( point.ptX, 0.5 * point.alt, point.ptY );
				mesh.scale.set( 5, point.alt, 5 );
				diagrams.add( mesh );

				mesh = drawSprite( place[0] + ' ' + point.alt , scalePlacard, '#0f0', point.ptX, 50 + point.alt , point.ptY );
				mesh.material.opacity = 0.5;
				diagrams.add( mesh );

				if ( place[5] > 0 ) {
					var unitsPerNM = 256 * Math.pow( 2, uf.zoom ) / ( 21638.777908207343 * Math.cos( uf.ulLat * d2r) ); 

					airportData = requestFile( '../apt1000/' +  place[0] + '.json' );
					var data = JSON.parse( airportData );
					material = new THREE.MeshBasicMaterial( { color: 0xeeeeee, emissive: 0.3, opacity: 0.8, transparent: true });

					for (var j = 0, len = data.runways.length; j < len; j++) {

						run = data.runways[j];

						point = uf.getPoint( run.lat1, run.lon1, uf.zoom );
						point.ptX += off + uf.tileSize * ( point.tileX - pointStart.tileX );
						point.ptY += off + uf.tileSize * ( point.tileY - pointStart.tileY );

						alt = getAltitude( run.lat1, run.lon1 );
						point.alt = uf.scaleVerticalCurrent * alt;

						point2 = uf.getPoint( run.lat2, run.lon2, uf.zoom );
						point2.ptX += off + uf.tileSize * ( point2.tileX - pointStart.tileX );
						point2.ptY += off + uf.tileSize * ( point2.tileY - pointStart.tileY );

						vStart = new THREE.Vector3( point.ptX, point.alt, point.ptY );
						vEnd = new THREE.Vector3( point2.ptX, point.alt, point2.ptY );
						length = vStart.distanceTo( vEnd );
						geometry = new THREE.BoxGeometry( 10, 10, length );
						
						mesh = new THREE.Mesh( geometry, material );
						mesh.position.set(  point.ptX, 5 + point.alt, point.ptY );
						mesh.rotation.y = ( run.hdg) * -d2r;

						mesh.translateZ( -0.5 * length );
						diagrams.add( mesh );

					}

					material = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, side: THREE.DoubleSide, transparent: true });
					if ( uf.zoom > 9 ) {
						for ( j = 0, len = data.ils.length; j < len; j++ ) {
							ils = data.ils[j];
							if ( ils.desc.search('ILS') > -1 ) {
								point = uf.getPoint( ils.lat, ils.lon, uf.zoom );
								point.ptX += off + uf.tileSize * ( point.tileX - pointStart.tileX );
								point.ptY += off + uf.tileSize * ( point.tileY - pointStart.tileY );
								alt = getAltitude( ils.lat, ils.lon );
								point.alt = uf.scaleVerticalCurrent * alt;
								length = unitsPerNM * ils.rng_nm;

								geometry = new THREE.CylinderGeometry( 30, 3, length, 20, 1, 1 );
								geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0.5 * length, 0) );
								geometry.applyMatrix( new THREE.Matrix4().makeRotationX( 1.45 ) );  // what is the correct angle?
								material = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.25, side: THREE.DoubleSide, transparent: true });
								mesh = new THREE.Mesh( geometry, material );
								mesh.position.set( point.ptX, 5 + point.alt, point.ptY );
								mesh.rotation.y = ils.hdg * -d2r;
								diagrams.add( mesh );
							}
						}
						messages.innerHTML = '';
					} else {
						messages.innerHTML = '<small style=color:red; >Diagrams for this zoom level coming soon...</small>';
					}
				}
			}
		}

		drawAirportData( navaidsFileName, 1, 2, 0xffff00 );
		drawAirportData( heliFileName, 2, 3, 0xffa500 );
		drawAirportData( seaFileName, 2, 3, 0x00ffff );

		uf.scene.add( diagrams );

		function drawAirportData( fName, la, ln, color ) {
			var data = requestFile( fName );
			var lines = data.split(/\r\n|\n/);
			var geometry = new THREE.CylinderGeometry( 1, 12, 80, 5 );
			var material = new THREE.MeshBasicMaterial( { color: color, opacity: 0.5, transparent: true }); 
			var place, lat, lon, point, alt, mesh;

			for ( var i = 1, length = lines.length - 1; i < length; i++ ) {
				place = lines[i].split( ',' ) ;
				lat = parseFloat( place[ la ] );
				lon = parseFloat( place[ ln ] );
				if ( lat < uf.ulLat && lat > uf.lrLat && lon > uf.ulLon && lon < uf.lrLon ) {
					point = uf.getPoint( lat, lon, uf.zoom );
					point.ptX += off + uf.tileSize * ( point.tileX - pointStart.tileX );
					point.ptY += off + uf.tileSize * ( point.tileY - pointStart.tileY );
					alt = getAltitude( lat, lon );
					point.alt = uf.scaleVerticalCurrent * alt;
					mesh = new THREE.Mesh( geometry, material );
					mesh.position.set( point.ptX, 5 + point.alt, point.ptY );
					diagrams.add( mesh );
				}
			}
		}
	}

	function animate() {
		requestAnimationFrame( animate );
		var delta = clock.getDelta();
//		controls.update( delta );
		uf.controls.update();
		uf.renderer.render( uf.scene, uf.camera );
		stats.update();
		if ( uf.update ) {
			updatePlacards();
			updateDiagrams();
			uf.update = false;
		}
		tim += delta;
		if ( tim > 3 ) {
			getFGTracker();
			tim = 0;
		}
	}