var addRegex = new RegExp( /^(!|\/)todo\s(\-a)\s(.+)$/ );
var listRegex = new RegExp( /^(!|\/)todo$/ );
var removeRegex = new RegExp( /^(!|\/)todo\s(\-r)\s(\d{1})$/ );
var completeRegex = new RegExp( /^(!|\/)todo\s(\-c)\s(\d{1})$/ );

/**
 * COMMANDS:
 *
 * List items:
 * 	!todo
 * Add item:
 * 	!todo -a Item name
 * Complete item:
 * 	!todo -c Item #
 * Remove item:
 * 	!todo -c Item #
 */

module.exports = [{
    types: ['message'],
    regex: listRegex,
    action: function( chat, stanza ) {
		// LIST ITEMS
        var todos = chat.getSetting('todos') || [];
        var msg = '';

        if ( todos.length === 0 ) {
            msg = 'No todos.'
        } else {
            msg = 'Todos:\n';
            todos.forEach( function( todo, i ) {
                msg += (i + 1) + '. ' + todo + '\n';
            } );
        }
        chat.sendMessage( msg );
    }
}, {
    types: ['message'],
    regex: addRegex,
    action: function( chat, stanza ) {
		// ADD ITEMS
        var user = chat.getUser( stanza.fromUsername );
        if ( user.role === 'moderator' ) {
            var todos = chat.getSetting('todos') || [];
            var item = addRegex.exec( stanza.message )[3];

            todos.push( item );
            chat.saveSetting('todos', todos);
        }
    }
}, {
    types: ['message'],
    regex: removeRegex,
    action: function( chat, stanza ) {
		// REMOVE ITEMS
		var user = chat.getUser( stanza.fromUsername );
        if ( user.role === 'moderator' ) {
	        var todos = chat.getSetting('todos') || [];
	        var todoIndex = parseInt( removeRegex.exec( stanza.message )[3], 10 );
			var itemToRemove = todos[ todoIndex - 1 ];

			if ( !itemToRemove ) {
	            chat.sendMessage( 'Todo #' + todoIndex + ' not found!' );
				return;
	        }

	        todos.splice( todoIndex - 1, 1 );
	        chat.saveSetting('todos', todos);

	        chat.sendMessage( 'Removed Todo #' + todoIndex + '.' );
		}
    }
}, {
    types: ['message'],
    regex: completeRegex,
    action: function( chat, stanza ) {
		// COMPLETE ITEMS
		var user = chat.getUser( stanza.fromUsername );
        if ( user.role === 'moderator' ) {
	        var todos = chat.getSetting('todos') || [];
			var completedTodos = chat.getSetting('completedTodos') || [];
	        var todoIndex = parseInt( completeRegex.exec( stanza.message )[3], 10 );
	        var itemToComplete = todos[ todoIndex - 1 ];

	        if ( !itemToComplete ) {
	            chat.sendMessage( 'Todo #' + todoIndex + ' not found!' );
				return;
	        }

			// Save the completed item to the completed todos array
			completedTodos.push( itemToComplete );
			chat.saveSetting('completedTodos', completedTodos);

			// Remove the completed item from the todos array
	        todos.splice( todoIndex - 1, 1 );
	        chat.saveSetting('todos', todos);

	        chat.sendMessage( 'Moved Todo #' + todoIndex + ' to the completed list.' );
		}
    }
}];