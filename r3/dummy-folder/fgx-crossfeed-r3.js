	var clock = new THREE.Clock();
	var tim = 0;

	var aircraft;
	var seymour;
	var crossfeed, crossfeedDiv, crossfeedText;

	var pi = Math.PI, pi05 = pi * 0.5;
	var d2r = pi / 180, r2d = 180 / pi;  // degress / radians

	function addCrossfeed() {
		crossfeedDiv = document.body.appendChild( document.createElement( 'div' ) );
		crossfeedDiv.id = 'movable';
		crossfeedDiv.style.cssText = ' background-color: #ccc; height: 300px; right: 20px; opacity: 0.8; bottom: 20px; width: 300px; ';
		crossfeedDiv.addEventListener( 'mousedown', mouseMove, false );
		crossfeedDiv.innerHTML = crossfeedText = 
			'<div id=closer onclick=crossfeedDiv.style.display="none"; >[x]</div>' +
			'<h2>FGx Crossfeed</h2>' +
		'';

		var loader = new THREE.JSONLoader();
		
		loader.load( '../../data/seymour.js', function( geometry ) { 
			geometry.applyMatrix( new THREE.Matrix4().makeRotationY( pi ) );
			geometry.applyMatrix( new THREE.Matrix4().multiplyScalar( 3 ) );
			seymour = geometry;
		} );
	}

	function getCrossfeed() {
		crossfeed = JSON.parse( requestFile( 'http://crossfeed.fgx.ch/flights.json' ) ); 
		if ( !crossfeed ) return;
		if ( aircraft && aircraft.children.length > 0) { 
			uf.scene.remove( aircraft );
			aircraft.children.length = 0;
		}	
		aircraft = new THREE.Object3D();

		var txt = '';
		var material = new THREE.MeshNormalMaterial();
		var pointStart = uf.getPoint( uf.lat, uf.lon, uf.zoom );
		var alt, point, mesh;
		var off = uf.tilesPerSide % 2 > 0 ? -128 : -256;
//		var scale = 0.5 * uf.scaleVertical * uf.zoomScales[ uf.zoom ][1];

		var distance = uf.camera.position.distanceTo( uf.controls.target );
		var scalePlacard = 0.0002 * distance;
		
		for ( var i = 0, iLen = crossfeed.flights.length; i < iLen; i++ ) {
			f = crossfeed.flights[i];
			if ( f.lat < uf.ulLat && f.lat > uf.lrLat && f.lon > uf.ulLon  && f.lon < uf.lrLon ) {
				point = uf.getPoint( f.lat, f.lon, uf.zoom );
				point.ptX += off + uf.tileSize * ( point.tileX - pointStart.tileX );
				point.ptY += off + uf.tileSize * ( point.tileY - pointStart.tileY );
				point.alt = ( f.alt_ft > 1000 ) ? 1000 : 15 + 0.5 * f.alt_ft;
				mesh = new THREE.Mesh( seymour, material );

				mesh.position.set( point.ptX, point.alt, point.ptY );
				mesh.rotation.y = f.hdg * d2r;
				aircraft.add( mesh );

				mesh = drawSprite( [ f.callsign, f.model.split('/')[1], 'Alt:' + f.alt_ft,  ], scalePlacard, '#fff', point.ptX, 50 + point.alt , point.ptY );
				mesh.material.opacity = 0.5;
				aircraft.add( mesh );
			}
			txt += '<tr>' +
			'<td><a href=JavaScript:uf.lat=' + f.lat +';uf.lon=' + f.lon + ';icaoStartPlace="";uf.drawTerrain(); >' + f.callsign + '</a></td><td>' +  f.model.split('/')[1] + '</td><td>' +
			f.alt_ft + '</td><td>' + f.spd_kts + '</td><td>' + f.hdg + '</td><td>' +  f.lat  + '</td><td>' + f.lon  + '</td><td>' +  f.dist_nm + '</td>' +  
			'</tr>';
		}
		crossfeedDiv.innerHTML = crossfeedText + '<table><tr><td colspan=7>' +  crossfeed.flights.length + ' aircraft online</td></tr>' +  
			'<tr><td>callsign </td><td>model</td><td>altitide </td><td>speed</td><td>heading</td><td>lat</td><td>lon</td><td>distance</td></tr>' + 
			txt +
		'</table>';

		uf.scene.add( aircraft );
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
			uf.update = false;
		}
		tim += delta;
		if ( tim > 3 ) {
			getCrossfeed();
			tim = 0;
		}
	}