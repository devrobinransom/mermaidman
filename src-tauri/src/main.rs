// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;
mod state;

use state::AppState;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            commands::document::open_doc,
            commands::document::save_doc,
            commands::document::close_doc,
            commands::reconcile::reconcile,
            commands::search::search,
            commands::search::get_backlinks,
        ])
        .setup(|app| {
            // Initialize database
            let app_state: tauri::State<AppState> = app.state();
            app_state.init_db()?;
            
            #[cfg(debug_assertions)]
            {
                // Export TypeScript types in development
                use commands::*;
                use tauri_specta::*;
                
                let builder = Builder::<tauri::Wry>::new()
                    .commands(collect_commands![
                        document::open_doc,
                        document::save_doc,
                        document::close_doc,
                        reconcile::reconcile,
                        search::search,
                        search::get_backlinks,
                    ]);
                
                builder
                    .export(
                        specta_typescript::Typescript::default(),
                        "../apps/web/src/lib/tauri-bindings.ts",
                    )
                    .expect("Failed to export TypeScript bindings");
            }
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
